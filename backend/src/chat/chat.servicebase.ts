import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { EChannelType, IChannel, ISendMessage, ITab } from './properties';
import { ChatDAO } from './chat.dao';
import { Socket, Server } from 'socket.io';
import { IGameUser, IUser } from 'src/games/properties';
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
      .filter((l) => l.type === EChannelType.PUBLIC);
    return list.map((l) => { return {
      user: user,
      type: l.type,
      id: l.type,
      title: l.title,
      prev: l.id,
    }})
  }

  public updateActiveClients(data: IChannel, client: Socket) {
    if (!data.user || !data.user.intraname) return;
    for (const [key, value] of this.activeClients) {
      const tmp = value.filter((c) => c.user.intraname !== data.user.intraname);
      this.activeClients.set(key, tmp);
    }
    if (!this.activeClients.has(data.id)) this.activeClients.set(data.id, []);
    this.activeClients.get(data.id).push({ user: data.user, socket: client });
  }

  protected getUserInChannel(name: string, room: number): IGameUser {
    return this.activeClients.get(room).find((user) => user.user.intraname === name);
  }

  public getUser(name: string): IGameUser | null {
    for (const [key, value] of this.activeClients) {
      const user = value.find((u) => u.user.intraname === name);
      if (user) return user;
    }
    return null;
  }

  public removeUser(name: string) {
    for (const [key, value] of this.activeClients) {
      const tmp = value.filter((u) => u.user.intraname !== name);
      this.activeClients.set(key, tmp);
    }
  }

  public async getChats(userId: string): Promise<ITab[]> {
    let res: ITab[] = [];
    try {
      const user = await this.userService.findOneByIntraName(userId);
      res = await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
    }
    return res;
  }

  public async addChat(chat: IChannel): Promise<ITab[]> {
    const res: ITab[] = [];
    try {
      const user = await this.userService.findOneByIntraName(chat.user.intraname);
      await this.chatDao.saveChannel(chat, chat.user.intraname);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
    }
    return res;
  }

  public async addU2UChat(chat: IChannel, server: Server): Promise<ITab[]> {
    try {
      const send = async (name: string) => {
        const u = this.getUser(name);
        if (u) {
          server
            .to(u.socket.id)
            .emit('invite', await this.chatDao.getRawUserChannels(u.user.id));
        }
      };
      const user = await this.userService.findOneByName(chat.user.name);
      const user2 = await this.userService.findOneByName(chat.title);
      if (await this.chatDao.checkForChat(user.id, user2.id)) return ;
      const cha = await this.chatDao.saveChannel(chat, chat.user.intraname);
      await this.chatDao.addUserToChannel(cha.id, chat.title);
      await send(user.intraname);
      await send(user2.intraname);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
    }
    return [];
  }

  public async removeChat(userId: string, chat: number): Promise<void> {
    try {
      const channel = await this.chatDao.getChannel(chat);
      const owner = await this.chatDao.getChannelOwner(chat);
      if (userId === owner.intraname || channel.type === EChannelType.CHAT) {
        channel.users.forEach(async (u) => {
          await this.chatDao.removeUserFromChannel(chat, u.intraname);
          this.getUser(u.intraname).socket.leave(channel.id.toString());
        });
        this.chatDao.channelRepo.remove(channel);
      }
      else {
        await this.chatDao.removeUserFromChannel(chat, userId);
      }
    } catch (error) {
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
      const mess = `${data.user.name} joined room`;
      const blocking: User[] = await this.userService.getBlocking(data.user.name);
      const blockNames: string[] = blocking.map((u) => {
        return u.intraname;
      })
      if (data.prev)
        client.leave(data.prev.toString());
      client.join(channel.id.toString());
      if (data.prev !== channel.id) {
        server
          .to(channel.id.toString())
          .emit('message', {message: mess, block: blockNames});
      }
      res = await this.chatDao.getRawChannelMessages(channel.id, data.user.intraname);
    } catch (error) {
      (`SYSTEM: ${error.message.split('\n')[0]}`);
    }
    return res.map((m) => {
      return { message: m, block: []};
    });
  }
}
