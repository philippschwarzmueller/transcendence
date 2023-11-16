import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOneByName(userId: string): Promise<User> {
    const res: User = await this.usersRepository.findOne({
      where: { name: userId },
    });
    if (res) {
      return res;
    } else {
      throw new Error('User not found');
    }
  }

  async updateUserChat(user: User, chat: string): Promise<User> {
    if (user) {
      user.activeChats.push(chat);
      return await this.usersRepository.save(user);
    } else {
      return undefined;
    }
  }

  async removeUserChat(user: User, chat: string): Promise<User> {
    if (user) {
      const index: number = user.activeChats.findIndex((obj) => obj === chat);
      user.activeChats.splice(index, 1);
      return await this.usersRepository.save(user);
    } else {
      return undefined;
    }
  }

  async clearActiveChats(user: User): Promise<User> {
    if (user) {
      user.activeChats.splice(0, user.activeChats.length);
      return await this.usersRepository.save(user);
    } else {
      return undefined;
    }
  }

  async getBlockList(userId: string): Promise<User[]> {
    return (await this.usersRepository.findOne({
      where: { name: userId },
      relations: ['blocked'],
    })).blocked;
  }

  async addToBlockList(userId: string, blockedId: string ): Promise<void> {
    const user = await this.findOneByName(userId);
    const block = await this.findOneByName(blockedId);
    const queryRunner = this.dataSource.createQueryRunner();
    console.log(`${userId} ${blockedId}`);
    queryRunner.connect();
    await queryRunner.manager.query(
      `INSERT INTO block_list (blocking, "blocked")
        VALUES (${user.id}, ${block.id})
        ON CONFLICT (blocking, "blocked") DO NOTHING;`,
    );
    queryRunner.release();
  }
}
