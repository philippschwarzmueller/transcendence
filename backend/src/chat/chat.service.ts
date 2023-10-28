import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Messages } from './chat.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatService {
  constructor(
    @Inject(UsersService)
    private uS: UsersService,
    @InjectRepository(Messages)
    private mR: Repository<Messages>,
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

  async getMessages(userId: string): Promise<string[]> {
    const user: User = await this.uS.findOneByName(userId);
    return await this.mR
      .createQueryBuilder()
      .select('content')
      .where('senderId = :id', { id: user.id })
      .getRawMany();
  }

  async clearActiveChats(userId: string): Promise<User | undefined> {
    const user = await this.uS.findOneByName(userId);
    if (user) {
      return await this.uS.clearActiveChats(user);
    }
  }
}
