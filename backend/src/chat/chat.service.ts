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
    const user = await this.userService.findOneByName(userId);
    if (user) return await this.chatDao.getRawUserChannels(user.id);
  }

  async addChat(userId: string, chatName: string): Promise<User | undefined> {
    const user = await this.userService.findOneByName(userId);
    if (user) {
      return await this.userService.updateUserChat(user, chatName);
    } else {
      return undefined;
    }
  }

  async removeChat(userId: string, chat: string): Promise<User | undefined> {
    const user = await this.userService.findOneByName(userId);
    if (user) {
      return await this.userService.removeUserChat(user, chat);
    } else {
      return undefined;
    }
  }

  async clearActiveChats(userId: string): Promise<User | undefined> {
    const user = await this.userService.findOneByName(userId);
    if (user) {
      return await this.userService.clearActiveChats(user);
    }
  }

  async joinRoom(data: IMessage, client: Socket) {
    const mess = `${data.user.name} joined ${data.room}`;
    let channel = await this.chatDao.getChannelByTitle(data.room);
    manageUsers(data, client);
    client.join(data.room);
    if (channel === undefined)
      channel = await this.chatDao.saveChannel(data.room, data.user);
    this.chatDao.addUserToChannel(data.room, data.user);
    this.chatDao.saveMessageToChannel(data);
    client.to(data.room).emit('message', mess);
    return this.chatDao.getChannelMessages(channel.id);
  }

  handleMessage( data: IMessage, client: Socket, server: Server) {
    manageUsers(data, client);
    const mess = `${data.user.name}: ${data.input}`;
    if (!gameInvite(data, server) && !gameAccept(data, server)) {
      server.to(data.room).emit('message', mess);
      this.chatDao.saveMessageToChannel(data);
    }
  }
}
