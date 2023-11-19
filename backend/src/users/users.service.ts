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

  async exchangeTokenforUser(frontendToken: string): Promise<User | null> {
    const user: User = await this.usersRepository.findOne({
      where: {
        hashedToken: frontendToken,
      },
    });
    if (!user) {
      return null;
    }
    return user;
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

  async getFriendRequestList(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['friend_requested'], //blocked
      })
    ).friend_requested; //blocked
  }

  async getReceivedFriendRequestList(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['friend_requests_received'], //blocked
      })
    ).friend_requests_received; //blocked
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    const user = await this.findOneByName(userId);
    const friend = await this.findOneByName(friendId);
    const queryRunner = this.dataSource.createQueryRunner();
    console.log(`${userId} sends friend request to ${friendId}`);
    queryRunner.connect();
    await queryRunner.manager.query(
      `INSERT INTO pending_friend_list (requesting_friend, "received_friend_request")
        VALUES (${user.id}, ${friend.id})
        ON CONFLICT (requesting_friend, "received_friend_request") DO NOTHING;`,
    );
    queryRunner.release();
  }

  async acceptFriendRequest(userName: string, friendName: string) {
    // Assuming you have a UserRepository and it can access the User entity
    const user = await this.findOneByName(userName);
    const friend = await this.findOneByName(friendName);

    // Remove the friend request
    user.friend_requests_received = user.friend_requests_received.filter(
      (fr) => fr.name !== friendName,
    );
    await this.usersRepository.save(user);

    // Add each other as friends
    user.friends.push(friend);
    friend.friends.push(user);

    await this.usersRepository.save([user, friend]);
  }
}
