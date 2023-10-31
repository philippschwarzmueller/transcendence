import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { IMessage } from './properties';
import { ChatDAO } from './chat.dao';
import { manageUsers, gameInvite, gameAccept } from './chat.gameinvite';
import { Socket, Server } from 'socket.io';

const rooms: string[] = [];
const messages: Map<string, string[]> = new Map<string, string[]>();

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
    if (user) return user.activeChats;
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

  joinRoom(data: IMessage, client: Socket) {
    const mess = `${data.user.name} joined ${data.room}`;
    manageUsers(data, client);
    client.join(data.room);
    if (!messages.has(data.room)) {
      messages.set(data.room, []);
      rooms.push(data.room);
    }
    client.to(data.room).emit('message', mess);
    messages.get(data.room).push(mess);
    return messages.get(data.room);

  }

  handleMessage( data: IMessage, client: Socket, server: Server) {
    manageUsers(data, client);
    const mess = `${data.user.name}: ${data.input}`;
    if (!gameInvite(data, server) && !gameAccept(data, server)) {
      server.to(data.room).emit('message', mess);
      messages.get(data.room).push(mess);
    }
  }
}
