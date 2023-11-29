import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EChannelType, IChannel, ISendMessage } from './properties';
import { ChatDAO } from './chat.dao';
import { Socket, Server } from 'socket.io';
import { IGameUser } from 'src/games/properties';
import { User } from 'src/users/user.entity';

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
    if (!data.title) data.title = '';
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

  public async addChat(chat: IChannel): Promise<string[]> {
    const res: string[] = [];
    try {
      const user = await this.userService.findOneByName(chat.user.name);
      await this.chatDao.saveChannel(chat, chat.user.name);
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

  public async joinRoom(
    data: IChannel,
    client: Socket,
    server: Server,
  ): Promise<ISendMessage[]> {
    let res: string[] = [];
    try {
      this.updateActiveClients(data, client);
      const channel = await this.chatDao.getChannelByTitle(data.title);
      client.join(channel.title);
      const mess = `${data.user.name}: joined room`;
      const blocking: User[] = await this.userService.getBlocking(data.user.name);
      const blockNames: string[] = blocking.map((u) => {
        return u.intraname;
      })
      res = await this.chatDao.getRawChannelMessages(channel.id, data.user.name);
      server.to(data.title).emit('message', {message: mess, block: blockNames} );
    } catch (error) {
      (`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res.map((m) => {
      return { message: m, block: []};
    });
  }
}
