import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EChannelType, IChannel } from './properties';
import { ChatDAO } from './chat.dao';
import { Socket, Server } from 'socket.io';
import { IGameUser } from 'src/games/properties';

@Injectable()
export class ChatServiceBase {
  constructor(
    @Inject(UsersService)
    protected userService: UsersService,
    @Inject(ChatDAO)
    protected chatDao: ChatDAO,
  ) {
    this.initializeMap();
  }

  activeClients: Map<string, IGameUser[]> = new Map<string, IGameUser[]>();
  opponents: Map<string, string> = new Map<string, string>();

  private async initializeMap(): Promise<void> {
    const list = await this.chatDao.getAllChannels();
    list.forEach((item) => {
      this.activeClients.set(item, []);
    });
  }

  protected updateActiveClients(data: IChannel, client: Socket) {
    for (const [key, value] of this.activeClients) {
      const tmp = value.filter((c) => c.user.name !== data.user.name);
      this.activeClients.set(key, tmp);
    }
    if (!this.activeClients.has(data.title))
      this.activeClients.set(data.title, []);
    this.activeClients
      .get(data.title)
      .push({ user: data.user, socket: client });
  }

  protected getUserInChannel(name: string, room: string): IGameUser {
    return this.activeClients.get(room).find((user) => user.user.name === name);
  }

  protected getUser(name: string): IGameUser | null {
    for (const [key, value] of this.activeClients) {
      const user = value.find((u) => u.user.name === name);
      if (user) return user;
    }
    return null;
  }

  public async getChats(userId: string): Promise<string[]> {
    let res: string[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      res = await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res;
  }

  public async addChat(
    chat: IChannel,
    client: Socket,
    server: Server,
  ): Promise<string[]> {
    const res: string[] = [];
    try {
      const user = await this.userService.findOneByName(chat.user.name);
      await this.chatDao.saveChannel(chat, chat.user.name);
      client.join(chat.title);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res;
  }

  public async removeChat(userId: string, chat: string): Promise<void> {
    try {
      await this.chatDao.removeUserFromChannel(chat, userId);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
  }

  public async joinRoom(data: IChannel, client: Socket): Promise<string[]> {
    let res: string[] = [];
    try {
      const channel = await this.chatDao.getChannelByTitle(data.title);
      client.join(data.title);
      this.updateActiveClients(data, client);
      await this.chatDao.saveMessageToChannel({
        user: data.user,
        input: 'joined room',
        room: data.title,
      });
      client.to(data.title).emit('message', `${data.user.name}: joined room`);
      res = await this.chatDao.getRawChannelMessages(channel.id);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res;
  }
}
