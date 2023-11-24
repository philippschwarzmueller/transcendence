import { Channels, Messages } from './chat.entity';
import { User } from 'src/users/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EChannelType, IChannel, IMessage, ITab } from './properties';
import { UsersService } from 'src/users/users.service';
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChatDAO {
  constructor(
    @InjectRepository(Channels)
    private channelRepo: Repository<Channels>,
    @InjectRepository(Messages)
    private messsageRepo: Repository<Messages>,
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
    console.log('user kommt bis hier');
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

  public async getRawChannelMessages(channelId: number): Promise<string[]> {
    return (await this.getChannelMessages(channelId)).map((item) => {
      return `${item.sender.name}: ${item.content}`;
    });
  }

  public async getUserChannels(userId: number): Promise<Channels[]> {
    return await this.channelRepo
      .createQueryBuilder('channel')
      .innerJoin('channel.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  public async getAllChannels(): Promise<number[]> {
    const res: Channels[] = await this.channelRepo.find();
    return res.map((item) => {
      return item.id;
    });
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
  //updateUserRole
  //getMessagesFiltert
}
