import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IMessage, IUser } from './properties';
import { ChatDAO } from './chat.dao';
import { gameInvite, gameAccept, printVanillaMessage } from './chat.cmdlogic';
import { Socket, Server } from 'socket.io';
import { IGameUser } from 'src/games/properties';

@Injectable()
export class ChatService {
  constructor(
    @Inject(UsersService)
    private userService: UsersService,
    @Inject(ChatDAO)
    private chatDao: ChatDAO,
  ) {
    this.initializeMap();
  }

  activeClients: Map<string, IGameUser[]> = new Map<string, IGameUser[]>();

  async initializeMap(): Promise<void> {
    const list = await this.chatDao.getAllChannels();
    list.forEach((item) => {
      this.activeClients.set(item, []);
    });
  }

  private updateActiveClients(data: IMessage, client: Socket) {
    for (const [key, value] of this.activeClients) {
      let tmp = value.filter((c) => c.user.name !== data.user.name);
      this.activeClients.set(key, tmp);
    }
    if (!this.activeClients.has(data.room))
      this.activeClients.set(data.room, []);
    this.activeClients.get(data.room).push({ user: data.user, socket: client });
  }

  async getChats(userId: string): Promise<string[]> {
    let res: string[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      res = await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async addChat(
    userId: string,
    chatName: string,
    client: Socket,
  ): Promise<string[]> {
    let res: string[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      await this.chatDao.saveChannel(chatName, userId);
      client.join(chatName);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async removeChat(userId: string, chat: string): Promise<void> {
    try {
      const user = await this.userService.findOneByName(userId);
      await this.chatDao.removeUserFromChannel(chat, user);
    } catch (error) {
      console.log(error);
    }
  }

  async joinRoom(data: IMessage, client: Socket): Promise<string[]> {
    let res: string[] = [];
    try {
      const channel = await this.chatDao.getChannelByTitle(data.room);
      client.join(data.room);
      this.updateActiveClients(data, client);
      await this.chatDao.addUserToChannel(data.room, data.user.name);
      await this.chatDao.saveMessageToChannel({
        user: data.user,
        input: 'joined room',
        room: data.room,
      });
      client.to(data.room).emit('message', 'oheinzel: joined room');
      res = await this.chatDao.getRawChannelMessages(channel.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async handleMessage(data: IMessage, client: Socket, server: Server) {
    switch (data.input.substring(0, data.input.indexOf(' '))) {
      case '/invite':
        break;
      case '/kick':
        break;
      case '/promote':
        break;
      case '/demote':
        break;
      case '/mute':
        break;
      case '/challenge': {
        gameInvite(data, server, this.activeClients);
        break;
      }
      case 'yes': {
        gameAccept(data, this.activeClients);
        break;
      }
      default:
        printVanillaMessage(data, server, this.chatDao);
    }
  }
}
