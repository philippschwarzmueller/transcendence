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

  async addFriend(user: User, friend: User): Promise<void> {
    const reloadedUser = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friend_requested'],
    });
    const reloadedFriend = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friend_requests_received'],
    });
  
    if (!reloadedUser || !reloadedFriend) {
      throw new Error('User or friend not found');
    }
  
    // Add the friend to the user's sent friend requests
    reloadedUser.friend_requested.push(reloadedFriend);
    reloadedFriend.friend_requests_received.push(reloadedUser);
  
    await this.usersRepository.save(reloadedUser);
    await this.usersRepository.save(reloadedFriend);
  }
  
  

  async acceptFriendRequest(user: User, friend: User) {
    // Assuming you have a UserRepository and it can access the User entity

    // Remove the friend request
    user.friend_requests_received = user.friend_requests_received.filter(
      (fr) => fr.name !== friend.name,
    );
    await this.usersRepository.save(user);

    // Add each other as friends
    user.friends.push(friend);
    friend.friends.push(user);

    await this.usersRepository.save([user, friend]);
  }
}
