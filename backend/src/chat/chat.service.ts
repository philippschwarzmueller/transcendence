import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { ChatDAO } from './chat.dao';

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
}
