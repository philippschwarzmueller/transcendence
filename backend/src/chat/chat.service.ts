import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(UsersService)
    private uS: UsersService,
  ) {}

  async getChats(userId: string): Promise<string[]> {
    const user = await this.uS.findOneByName(userId);
    if (user) return user.activeChats;
  }

  async addChat(userId: string, chatName: string): Promise<User | undefined> {
    const user = await this.uS.findOneByName(userId);
    if (user) {
      return await this.uS.updateUserChat(user, chatName);
    } else {
      return undefined;
    }
  }

  async clearActiveChats(userId: string): Promise<User | undefined> {
    const user = await this.uS.findOneByName(userId);
    if (user) {
      return await this.uS.clearActiveChats(user);
    }
  }
}
