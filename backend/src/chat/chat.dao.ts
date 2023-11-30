import { Channels, Messages } from './chat.entity';
import { User } from 'src/users/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DMessage, EChannelType, IChannel, IMessage } from './properties';
import { UsersService } from 'src/users/users.service';

interface test {
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
        channel: await this.getChannelByTitle(message.room),
        content: message.input,
      }),
    );
  }

  public async saveChannel(channel: IChannel, user: string): Promise<void> {
    const existingChannel = await this.channelRepo.findOne({
      where: { title: channel.title },
    });
    if (existingChannel && existingChannel.type !== EChannelType.PRIVATE) {
      await this.addUserToChannel(channel.title, user);
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
  }

  public async addUserToChannel(title: string, user: string): Promise<void> {
    const channel: Channels = await this.getChannelByTitle(title);
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

  public async removeUserFromChannel(title: string, userId: string): Promise<void> {
    const channel: Channels = await this.getChannelByTitle(title);
    const user: User = await this.userService.findOneByName(userId);
    channel.users = channel.users.filter((u) => u.id !== user.id);
    this.channelRepo.save(channel);
  }

  public async getChannelByTitle(title: string): Promise<Channels> {
    return await this.channelRepo
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.users', 'users')
      .where('channel.title = :title', { title })
      .getOne();
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

  public async getAllChannels(): Promise<string[]> {
    const res: Channels[] = await this.channelRepo.find();
    return res.map((item) => {
      return item.title;
    });
  }

  public async getRawUserChannels(userId: number): Promise<string[]> {
    return (await this.getUserChannels(userId)).map((item) => {
      return item.title;
    });
  }

  public async getChannelOwner(title: string): Promise<User> {
    return (
      await this.channelRepo.findOne({
        where: { title: title },
        relations: ['owner'],
      })
    ).owner;
  }

  public async getMessagesFiltert(channelId: number, user: string): Promise<test[]> {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    const res: test[]  =  await queryRunner.manager.query(
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

  public async promoteUser(title: string, user: string) {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const channel: number = (await this.getChannelByTitle(title)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    const res: test[]  =  await queryRunner.manager.query(
      `INSERT INTO channel_administration (channel, "user")
        VALUES (${channel}, ${userId})
        ON CONFLICT (channel, "user") DO NOTHING;`,
    );
    queryRunner.release();
    return res;
  }

  public async demoteUser(title: string, user: string) {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const channel: number = (await this.getChannelByTitle(title)).id;
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    const res: test[]  =  await queryRunner.manager.query(
      `DELETE FROM channel_administration
      WHERE channel = ${channel} AND user = ${userId}`,
    );
    queryRunner.release();
    return res;
  }

  public async getAdmin(channel: string, user: string): Promise<number> {
    return (
      (await this.channelRepo.findOne({
        where: { title: channel },
        relations: ['admins'],
      })).admins.filter((a) => a.name === user).length
    );
  }

  public async muteUser(title: string, user: string, time: number) {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const channel: number = (await this.getChannelByTitle(title)).id;
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

  public async getMute(title: string, user: string): Promise<boolean> {
    const userId: number = (await this.userService.findOneByName(user)).id;
    const channel: number = (await this.getChannelByTitle(title)).id;
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
