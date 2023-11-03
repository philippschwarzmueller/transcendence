import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './properties';
import { ChatDAO } from './chat.dao';
import { manageUsers, gameInvite, gameAccept } from './chat.gameinvite';
import { Socket, Server } from 'socket.io';

@Injectable()
export class ChatService {
  constructor(
    @Inject(UsersService)
    private userService: UsersService,
    @Inject(ChatDAO)
    private chatDao: ChatDAO,
  ) {}


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

  async addChat(userId: string, chatName: string, client: Socket): Promise<string[]> {
    let res:string[] = [];
    try {
      const user = await this.userService.findOneByName(userId);
      await this.chatDao.saveChannel(chatName, userId);
      client.join(chatName);
      return await this.chatDao.getRawUserChannels(user.id);
    } catch(error) {
      console.log(error);
    }
    return res;
  }

  async removeChat(userId: string, chat: string): Promise<void> {
    try {
      const user = await this.userService.findOneByName(userId);
      await this.chatDao.removeUserFromChannel(chat, user);
    }
    catch(error) {
      console.log(error);
    }
  }


  async joinRoom(data: IMessage, client: Socket): Promise<string[]> {
    let res: string[] = [];
    try {
      const channel = await this.chatDao.getChannelByTitle(data.room);
      client.join(data.room);
      await this.chatDao.addUserToChannel(data.room, data.user.name);
      await this.chatDao.saveMessageToChannel({user: data.user, input: "joined room", room: data.room});
      client.to(data.room).emit('message', 'oheinzel: joined room');
      res = await this.chatDao.getRawChannelMessages(channel.id);
    } catch (error) {
      console.log(error);
    }
    return res;
  }

  async handleMessage( data: IMessage, client: Socket, server: Server) {
    try {
      manageUsers(data, client);
      const mess = `${data.user.name}: ${data.input}`;
      if (!gameInvite(data, server) && !gameAccept(data, server)) {
        server.to(data.room).emit('message', mess);
        await this.chatDao.saveMessageToChannel(data);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
