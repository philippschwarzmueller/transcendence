import { Channels, Messages } from './chat.entity';
import { User } from 'src/users/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IChannel, IMessage } from './properties';
import { UsersService } from 'src/users/users.service';

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
        channel: await this.getChannelByTitle(message.room),
        content: message.input,
      }),
    );
  }

  public async saveChannel(channel: IChannel, user: string): Promise<void> {
    const existingChannel = await this.channelRepo.findOne({
      where: { title: channel.title },
    });
    if (existingChannel) {
      await this.addUserToChannel(channel.title, user);
    } else {
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
    await queryRunner.manager
      .query(
        `INSERT INTO channel_subscription (channel, "user")
        VALUES (${channel.id}, ${newUser.id})
        ON CONFLICT (channel, "user") DO NOTHING;`,
      )
    queryRunner.release();
  }

  public async removeUserFromChannel(title: string, user: User): Promise<void> {
    const channel: Channels = await this.getChannelByTitle(title);
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

  //getChannelOwner
  //updateUserRole
  //getMessagesFiltert
}
