import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EChannelType, IChannel, ISendMessage, ITab, IUser } from './properties';
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

  activeClients: Map<number, IGameUser[]> = new Map<number, IGameUser[]>();
  opponents: Map<string, string> = new Map<string, string>();

  private async initializeMap(): Promise<void> {
    const list = await this.chatDao.getAllChannels();
    list.forEach((item) => {
      this.activeClients.set(item.id, []);
    });
  }

  public async getUserInChannelList(channelId: number): Promise<IUser[]> {
    const list = await this.chatDao.getChannelUsers(channelId)
    return list.map((l) => {
      return {
        id: l.id,
        name: l.name,
        intraname: l.intraname,
        twoFAenabled: l.twoFAenabled,
        profilePictureUrl: l.profilePictureUrl,
        token: l.token,
      }
    });
  }

  public async getChannelList(user: IUser): Promise<IChannel[]>{
    const list = (await this.chatDao.getAllChannels())
      .filter((l) => l.type !== EChannelType.CHAT);
    return list.map((l) => { return {
      user: user,
      type: l.type,
      id: l.type,
      title: l.title,
      prev: l.id,
    }})
  }
  public updateActiveClients(data: IChannel, client: Socket) {
    if (!data.user || !data.user.name) return;
    for (const [key, value] of this.activeClients) {
      const tmp = value.filter((c) => c.user.name !== data.user.name);
      this.activeClients.set(key, tmp);
    }
    if (!this.activeClients.has(data.id)) this.activeClients.set(data.id, []);
    this.activeClients.get(data.id).push({ user: data.user, socket: client });
  }

  protected getUserInChannel(name: string, room: number): IGameUser {
    return this.activeClients.get(room).find((user) => user.user.name === name);
  }

  protected getUser(name: string): IGameUser | null {
    for (const [key, value] of this.activeClients) {
      const user = value.find((u) => u.user.name === name);
      if (user) return user;
    }
    return null;
  }

  public removeUser(name: string) {
    for (const [key, value] of this.activeClients) {
      const tmp = value.filter((u) => u.user.name !== name);
      this.activeClients.set(key, tmp);
    }
  }

  public async getChats(userId: string): Promise<ITab[]> {
    let res: ITab[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      res = await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res;
  }

  public async addChat(chat: IChannel): Promise<ITab[]> {
    const res: ITab[] = [];
    try {
      const user = await this.userService.findOneByName(chat.user.name);
      await this.chatDao.saveChannel(chat, chat.user.name);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res;
  }

  public async addU2UChat(chat: IChannel, server: Server): Promise<ITab[]> {
    try {
      const send = async (name: string) => {
        const u = this.getUser(name);
        server
          .to(u.socket.id)
          .emit('invite', await this.chatDao.getRawUserChannels(u.user.id));
      };
      const user = await this.userService.findOneByName(chat.user.name);
      const user2 = await this.userService.findOneByName(chat.title);
      const cha = await this.chatDao.saveChannel(chat, chat.user.name);
      await this.chatDao.addUserToChannel(cha.id, chat.title);
      send(user.name);
      send(user2.name);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return [];
  }

  public async removeChat(userId: string, chat: number): Promise<void> {
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
      if (data.title === '') return;
      this.updateActiveClients(data, client);
      const channel = await this.chatDao.getChannel(data.id);
      const mess = `${data.user.name}: joined room`;
      const blocking: User[] = await this.userService.getBlocking(data.user.name);
      const blockNames: string[] = blocking.map((u) => {
        return u.intraname;
      })
      if (data.prev)
        client.leave(data.prev.toString());
      client.join(channel.id.toString());
      server
        .to(channel.id.toString())
        .emit('message', {message: mess, block: blockNames});
      res = await this.chatDao.getRawChannelMessages(channel.id, data.user.name);
    } catch (error) {
      (`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res.map((m) => {
      return { message: m, block: []};
    });
  }
}
