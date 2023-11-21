import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';

export enum FriendState {
  noFriend,
  pendingFriend,
  Friend,
}

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

  async findAllNames(): Promise<string[]> {
    const res: User[] = await this.usersRepository.find();
    return res.map((item) => {
      return item.name;
    });
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
    const sender = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friend_requested'],
    });
    const receiver = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friend_requests_received'],
    });

    if (!sender || !receiver) {
      throw new Error('User or friend not found');
    }

    sender.friend_requested.push(receiver);
    receiver.friend_requests_received.push(user);

    await this.usersRepository.save(sender);
    await this.usersRepository.save(receiver);
  }

  async acceptFriendRequest(user: User, friend: User) {
    const receiver: User = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friend_requests_received', 'friends', 'friend_requested'],
    });

    const sender: User = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friend_requested', 'friends', 'friend_requests_received'],
    });

    sender.friends.push(receiver);
    receiver.friends.push(sender);

    sender.friend_requested = sender.friend_requested.filter(
      (friend) => friend.name !== receiver.name,
    );
    receiver.friend_requests_received = sender.friend_requests_received.filter(
      (friend) => friend.name !== sender.name,
    );

    await this.usersRepository.save(sender);
    await this.usersRepository.save(receiver);
    await this.usersRepository.save([user, friend]);
  }

  async removeFriend(user: User, friend: User) {
    const remover: User = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friends'],
    });

    const removeFriend: User = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friends'],
    });

    remover.friends = remover.friends.filter(
      (friend) => friend.name !== removeFriend.name,
    );
    removeFriend.friends = removeFriend.friends.filter(
      (friend) => friend.name !== remover.name,
    );

    await this.usersRepository.save(remover);
    await this.usersRepository.save(removeFriend);
    await this.usersRepository.save([remover, removeFriend]);
  }

  async getFriendList(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['friends'],
      })
    ).friends;
  }

  async userIsFriend(user: string, friend: string): Promise<boolean> {
    const friends: User[] = await this.getFriendList(user);
    const isFriend: boolean = friends.some(
      (friendUser) => friendUser.name === friend,
    );
    return isFriend;
  }

  async userIsPendingFriend(user: string, friend: string): Promise<boolean> {
    const pendingFriends: User[] =
      await this.getReceivedFriendRequestList(user);
    const ispendingFriend: boolean = pendingFriends.some(
      (friendUser) => friendUser.name === friend,
    );
    return ispendingFriend;
  }

  async getFriendState(user: string, friend: string): Promise<FriendState> {
    const isFriend = await this.userIsFriend(user, friend);
    const isPendingFriend = await this.userIsPendingFriend(user, friend);

    if (isFriend) {
      return FriendState.Friend;
    } else if (isPendingFriend) {
      return FriendState.pendingFriend;
    } else {
      return FriendState.noFriend;
    }
  }
}
