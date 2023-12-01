import { Channels, Messages } from './chat.entity';
import { User } from 'src/users/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EChannelType, IChannel, IMessage, ITab } from './properties';
import { UsersService } from 'src/users/users.service';

interface DMessage {
  content: string;
  sender: string;
}

@Injectable()
export class ChatDAO {
  constructor(
    @InjectRepository(Channels)
    private channelRepo: Repository<Channels>,
    @InjectRepository(Messages)
    private messsageRepo: Repository<Messages>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject(UsersService)
    private userService: UsersService,
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  public async saveMessageToChannel(message: IMessage): Promise<void> {
    await this.messsageRepo.save(
      this.messsageRepo.create({
        sender: await this.userService.findOneByName(message.user.name),
        channel: await this.getChannel(message.room),
        content: message.input,
      }),
    );
  }

  public async saveChannel(channel: IChannel, user: string): Promise<Channels> {
    const existingChannel = await this.channelRepo.findOne({
      where: { title: channel.title },
    });
    if (existingChannel && existingChannel.type !== EChannelType.PRIVATE) {
      await this.addUserToChannel(existingChannel.id, user);
    } else if (!existingChannel) {
      await this.channelRepo.save(
        this.channelRepo.create({
          title: channel.title,
          owner: await this.userService.findOneByName(user),
          users: [await this.userService.findOneByName(user)],
          type: channel.type,
        }),
      );
    }
    return await this.channelRepo.findOne({
      where: { title: channel.title },
    });
  }

  public async addUserToChannel(id: number, user: string): Promise<void> {
    const channel: Channels = await this.getChannel(id);
    if (channel.type === EChannelType.CHAT && channel.users.length === 2)
      return;
    const newUser: User = await this.userService.findOneByName(user);
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    await queryRunner.manager.query(
      `INSERT INTO channel_subscription (channel, "user")
        VALUES (${channel.id}, ${newUser.id})
        ON CONFLICT (channel, "user") DO NOTHING;`,
    );
    queryRunner.release();
  }

  public async removeUserFromChannel(
    id: number,
    userId: string,
  ): Promise<void> {
    const channel: Channels = await this.getChannel(id);
    const user: User = await this.userService.findOneByName(userId);
    channel.users = channel.users.filter((u) => u.id !== user.id);
    this.channelRepo.save(channel);
  }

  public async getChannel(id: number): Promise<Channels> {
    return await this.channelRepo.findOne({
      where: { id: id },
      relations: ['users'],
    });
  }

  public async getChannelMessages(channelId: number): Promise<Messages[]> {
    return await this.messsageRepo
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.sender', 'sender')
      .where('message.channel = :id', { id: channelId })
      .orderBy('message.id', 'ASC')
      .getMany();
  }

  public async getRawChannelMessages(channelId: number, user: string): Promise<string[]> {
    return (await this.getMessagesFiltert(channelId, user)).map((item) => {
      return `${item.sender}: ${item.content}`;
    });
  }

  public async getUserChannels(userId: number): Promise<Channels[]> {
    return await this.channelRepo
      .createQueryBuilder('channel')
      .innerJoin('channel.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  public async getAllChannels(): Promise<Channels[]> {
    return await this.channelRepo.find();
  }

  public async getTitle(channel: Channels, userId: number): Promise<string> {
    if (channel.type !== EChannelType.CHAT) return channel.title;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    const res = await queryRunner.manager.query(
      `SELECT name
      FROM users
      INNER JOIN channel_subscription ON users.id = channel_subscription.user
      WHERE channel_subscription.channel = ${channel.id}
      AND users.id != ${userId}`,
    );
    queryRunner.release();
    if (res && res[0] && res[0].name) return res[0].name;
    return channel.title;
  }

  public async getRawUserChannels(userId: number): Promise<ITab[]> {
    const tmp: Channels[] = await this.getUserChannels(userId);
    return await Promise.all(
      tmp.map(async (item) => {
        return {
          type: item.type,
          id: item.id,
          title: await this.getTitle(item, userId),
        };
      }),
    );
  }

  public async getChannelOwner(id: number): Promise<User> {
    return (
      await this.channelRepo.findOne({
        where: { id: id },
        relations: ['owner'],
      })
    ).owner;
  }

  public async getMessagesFiltert(channelId: number, user: string): Promise<DMessage[]> {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    const res: DMessage[]  =  await queryRunner.manager.query(
      `SELECT messages.content, users.name as sender
      FROM messages
      LEFT JOIN users ON messages.sender = users.id
      WHERE messages.channel = ${channelId}
      AND messages.sender NOT IN (
        SELECT blocked
        FROM block_list
        WHERE blocking = ${userId}
      )
      ORDER BY messages.id;`
    );
    queryRunner.release();
    return res;
  }

  public async promoteUser(channel: number, user: string) {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    await queryRunner.manager.query(
      `INSERT INTO channel_administration (channel, "user")
        VALUES (${channel}, ${userId})
        ON CONFLICT (channel, "user") DO NOTHING;`,
    );
    queryRunner.release();
  }

  public async demoteUser(channel: number, user: string) {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    await queryRunner.manager.query(
      `DELETE FROM channel_administration
      WHERE channel = ${channel} AND user = ${userId}`,
    );
    queryRunner.release();
  }

  public async getAdmin(channel: number, user: string): Promise<number> {
    return (
      (await this.channelRepo.findOne({
        where: { id: channel },
        relations: ['admins'],
      })).admins.filter((a) => a.name === user).length
    );
  }

  public async muteUser(channel: number, user: string, time: number) {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    await queryRunner.manager.query(
      `INSERT INTO muted ("user", "channel", "time", "timestamp")
      VALUES (${userId}, ${channel}, ${time}, EXTRACT(EPOCH FROM CURRENT_TIMESTAMP))
      ON CONFLICT ("user", "channel")
      DO UPDATE SET "time" = EXCLUDED."time", "timestamp" = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP);`
    );
    queryRunner.release();
  }

  public async getMute(channel: number, user: string): Promise<boolean> {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    const current = new Date();
    queryRunner.connect();
    const res  =  await queryRunner.manager.query( 
      `SELECT time, timestamp
        FROM muted
        WHERE "user" = ${userId} AND "channel = ${channel};`
    );
    queryRunner.release();
    if (res.length === 0)
      return false;
    const check = res[0].timestamp + res[0].time * 60; 
    return check > Math.floor(current.getTime() / 1000);
  }
}
