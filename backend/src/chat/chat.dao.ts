import { Channels, Messages } from './chat.entity';
import { User } from 'src/users/user.entity';
import { Repository, QueryBuilder } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IMessage } from './properties';
import { IUser } from './properties';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatDAO {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Channels)
    private channelRepo: Repository<Channels>,
    @InjectRepository(Messages)
    private messsageRepo: Repository<Messages>,
    @Inject(UsersService)
    private userService: UsersService,
  ) {}

  public async saveMessageToChannel(
    message: IMessage,
    user: IUser,
  ): Promise<void> {
    this.messsageRepo.save(
      this.messsageRepo.create({
        sender: await this.userService.findOneByName(user.name),
        channel: await this.getChannelByTitle(message.room),
        content: message.input,
      }),
    );
  }

  public async saveChannel(
    title: string,
    user: IUser,
    firstMessage?: IMessage,
  ): Promise<void> {
    this.channelRepo.save(
      this.channelRepo.create({
        title: title,
        users: [await this.userService.findOneByName(user.name)],
      }),
    );
    this.saveMessageToChannel(firstMessage, user);
  }

  public async addUserToChannel(title: string, user: IUser): Promise<void> {
    const channel: Channels = await this.getChannelByTitle(title);
    const newUser: User = await this.userService.findOneByName(user.name);
    channel.users.push(newUser);
    this.channelRepo.save(channel);
  }

  public async removeUserFromChannel(
    title: string,
    user: IUser,
  ): Promise<void> {
    const channel: Channels = await this.getChannelByTitle(title);
    const newUser: User = await this.userService.findOneByName(user.name);
    channel.users = channel.users.filter((u) => u.id !== user.id);
    this.channelRepo.save(channel);
  }

  public async getChannelByTitle(title: string): Promise<Channels> {
    return await this.channelRepo.findOne({ where: { title } });
  }

  public async getChannelMessages(channelId: number): Promise<Messages[]> {
    return await this.messsageRepo
      .createQueryBuilder()
      .select('content')
      .where('channel = :id', { id: channelId })
      .getMany();
  }

  public async getRawChannelMessages(channelId: number): Promise<string[]> {
    return (await this.getChannelMessages(channelId)).map((item) => {
      return item.content;
    });
  }

  public async getUserChannels(userId: number): Promise<Channels[]> {
    return await this.channelRepo
      .createQueryBuilder()
      .innerJoin('channel.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
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
