import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Channels } from 'src/chat/chat.entity';
import { Game } from 'src/games/game.entity';

export enum FriendState {
  noFriend,
  requestedFriend,
  pendingFriend,
  friend,
}

export interface PublicUser {
  owned: Channels[];
  channels: Channels[];
  id?: number | undefined;
  name: string | undefined;
  intraname: string | undefined;
  twoFAenabled: boolean;
  profilePictureUrl: string | undefined;
  activeChats: string[];
  customAvatar?: string | undefined;
  hasCustomAvatar?: boolean;
  blocked: PublicUser[];
  blocking: PublicUser[];
  friend_requested: PublicUser[];
  friend_requests_received: PublicUser[];
  friends: PublicUser[];
  wonGames: Game[];
  lostGames: Game[];
  elo: number[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<User[]> {
    const users: User[] = await this.usersRepository.find();
    return users;
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

  async findOneByIntraName(intraname: string): Promise<User> {
    const res: User = await this.usersRepository.findOne({
      where: { intraname: intraname },
    });
    if (res) {
      return res;
    } else {
      throw new Error('User not found');
    }
  }

  public createPublicUser(user: User): PublicUser {
    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      intraname: user.intraname,
      twoFAenabled: user.twoFAenabled,
      profilePictureUrl: user.profilePictureUrl,
      activeChats: user.activeChats,
      customAvatar: user.customAvatar,
      hasCustomAvatar: user.hasCustomAvatar,
      owned: user.owned,
      channels: user.channels,
      blocked:
        user.blocked && user.blocked.length > 0
          ? this.createPublicUserArray(user.blocked)
          : [],
      blocking:
        user.blocking && user.blocking.length > 0
          ? this.createPublicUserArray(user.blocking)
          : [],
      friend_requested:
        user.friend_requested && user.friend_requested.length > 0
          ? this.createPublicUserArray(user.friend_requested)
          : [],
      friend_requests_received:
        user.friend_requests_received &&
        user.friend_requests_received.length > 0
          ? this.createPublicUserArray(user.friend_requests_received)
          : [],
      friends:
        user.friends && user.friends.length > 0
          ? this.createPublicUserArray(user.friends)
          : [],
      wonGames: user.wonGames,
      lostGames: user.lostGames,
      elo: user.elo,
    };
    return publicUser;
  }

  public createPublicUserArray(users: User[]): PublicUser[] {
    const publicUsers: PublicUser[] = users.map((user) => {
      return this.createPublicUser(user);
    });
    return publicUsers;
  }

  async getBlockList(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['blocked'],
      })
    ).blocked;
  }

  async getBlocking(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['blocking'],
      })
    ).blocking;
  }

  async findAllNames(): Promise<string[]> {
    const res: User[] = await this.usersRepository.find();
    return res.map((item) => {
      return item.name;
    });
  }

  //User for Token

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

  //Chat

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

  async isBlocked(userId: string, blockedId: string): Promise<boolean> {
    const user = await this.findOneByIntraName(userId);
    const blocked = await this.findOneByIntraName(blockedId);
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    const res = await queryRunner.manager.query(
      `SELECT EXISTS (
        SELECT 1
        FROM users
        INNER JOIN block_list
        ON users.id = block_list.blocking
        WHERE users.id = ${user.id}
        AND block_list.blocked = ${blocked.id}
      ) AS is_blocked;`,
    );
    queryRunner.release();
    return res[0].is_blocked;
  }

  async removeFromBlockList(
    userId: string,
    blockedId: string,
  ): Promise<boolean> {
    const user: User = await this.findOneByIntraName(userId);
    const blocked: User = await this.findOneByIntraName(blockedId);
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    await queryRunner.manager.query(
      `DELETE FROM block_list
      WHERE blocking = ${user.id} AND blocked = ${blocked.id}`,
    );
    queryRunner.release();
    return false;
  }

  async addToBlockList(userId: string, blockedId: string): Promise<boolean> {
    const user = await this.findOneByIntraName(userId);
    const block = await this.findOneByIntraName(blockedId);
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    await queryRunner.manager.query(
      `INSERT INTO block_list (blocking, "blocked")
        VALUES (${user.id}, ${block.id})
        ON CONFLICT (blocking, "blocked") DO NOTHING;`,
    );
    await queryRunner.manager.query(
      `DELETE FROM friends
      WHERE user_id = ${user.id} AND friend_id = ${block.id}`,
    );
    await queryRunner.manager.query(
      `DELETE FROM friends
      WHERE user_id = ${block.id} AND friend_id = ${user.id}`,
    );
    queryRunner.release();
    return true;
  }

  // Friends

  async getFriendRequestList(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['friend_requested'],
      })
    ).friend_requested;
  }

  async getReceivedFriendRequestList(userId: string): Promise<User[]> {
    return (
      await this.usersRepository.findOne({
        where: { name: userId },
        relations: ['friend_requests_received'],
      })
    ).friend_requests_received;
  }

  async addFriend(user: User, friend: User): Promise<boolean> {
    const sender: User = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friend_requested'],
    });
    const receiver: User = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friend_requests_received'],
    });

    if (!sender || !receiver) {
      throw new Error('User or friend not found');
    }

    const friendState: FriendState = await this.getFriendState(
      sender.name,
      receiver.name,
    );

    if (friendState !== FriendState.noFriend || user.name === friend.name) {
      return false;
    }

    sender.friend_requested.push(receiver);
    receiver.friend_requests_received.push(user);

    await this.usersRepository.save(sender);
    await this.usersRepository.save(receiver);
    return true;
  }

  async acceptFriendRequest(user: User, friend: User): Promise<boolean> {
    const receiver: User = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friend_requests_received', 'friends', 'friend_requested'],
    });

    const sender: User = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friend_requested', 'friends', 'friend_requests_received'],
    });

    const friendState: FriendState = await this.getFriendState(
      receiver.name,
      sender.name,
    );

    if (
      friendState !== FriendState.pendingFriend ||
      receiver.name === sender.name
    ) {
      return false;
    }

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
    return true;
  }

  async denyFriendRequest(user: User, friend: User): Promise<boolean> {
    const receiver: User = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friend_requests_received', 'friend_requested'],
    });

    const sender: User = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friend_requested', 'friend_requests_received'],
    });

    const friendState: FriendState = await this.getFriendState(
      receiver.name,
      sender.name,
    );

    if (
      friendState !== FriendState.pendingFriend ||
      receiver.name === sender.name
    ) {
      return false;
    }

    receiver.friend_requests_received =
      receiver.friend_requests_received.filter(
        (req) => req.name !== sender.name,
      );
    sender.friend_requested = sender.friend_requested.filter(
      (req) => req.name !== receiver.name,
    );

    await this.usersRepository.save(receiver);
    await this.usersRepository.save(sender);

    return true;
  }

  async removeFriend(user: User, friend: User): Promise<boolean> {
    const remover: User = await this.usersRepository.findOne({
      where: { name: user.name },
      relations: ['friends'],
    });

    const removeFriend: User = await this.usersRepository.findOne({
      where: { name: friend.name },
      relations: ['friends'],
    });

    const friendState: FriendState = await this.getFriendState(
      remover.name,
      removeFriend.name,
    );

    if (
      friendState !== FriendState.friend ||
      remover.name === removeFriend.name
    ) {
      return false;
    }

    remover.friends = remover.friends.filter(
      (friend) => friend.name !== removeFriend.name,
    );
    removeFriend.friends = removeFriend.friends.filter(
      (friend) => friend.name !== remover.name,
    );

    await this.usersRepository.save(remover);
    await this.usersRepository.save(removeFriend);
    await this.usersRepository.save([remover, removeFriend]);
    return true;
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

  async userIsRequestedFriend(user: string, friend: string): Promise<boolean> {
    const RequestedFriends: User[] = await this.getFriendRequestList(user);
    const isRequestedFriend: boolean = RequestedFriends.some(
      (friendUser) => friendUser.name === friend,
    );
    return isRequestedFriend;
  }

  async getFriendState(user: string, friend: string): Promise<FriendState> {
    const isFriend: boolean = await this.userIsFriend(user, friend);
    const isPendingFriend: boolean = await this.userIsPendingFriend(
      user,
      friend,
    );
    const isRequestedFriend: boolean = await this.userIsRequestedFriend(
      user,
      friend,
    );

    if (isFriend) {
      return FriendState.friend;
    } else if (isPendingFriend) {
      return FriendState.pendingFriend;
    } else if (isRequestedFriend) {
      return FriendState.requestedFriend;
    } else {
      return FriendState.noFriend;
    }
  }

  //Change Avatar

  async changeAvatar(user: string, avatar: string): Promise<boolean> {
    const result = await this.usersRepository.update(
      {
        name: user,
      },
      {
        customAvatar: avatar,
        hasCustomAvatar: true,
      },
    );
    if (result.affected && result.affected > 0) {
      return true;
    } else {
      return false;
    }
  }

  async getCustomAvatar(user: string): Promise<string> {
    const res: User = await this.usersRepository.findOne({
      where: { name: user },
    });
    return res.customAvatar;
  }

  async hasCustomAvatar(user: string): Promise<boolean> {
    const res: User = await this.usersRepository.findOne({
      where: { name: user },
    });
    return res.hasCustomAvatar;
  }

  async backToFallbackProfilePicture(user: string): Promise<boolean> {
    const result = await this.usersRepository.update(
      {
        name: user,
      },
      {
        hasCustomAvatar: false,
      },
    );
    if (result.affected && result.affected > 0) {
      return true;
    }
    return false;
  }
}
