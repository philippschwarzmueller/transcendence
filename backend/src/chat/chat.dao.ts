import { Channels, Messages } from "./chat.entity";
import { User } from "src/users/user.entity";
import { Repository, QueryBuilder } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IMessage } from "./properties";
import { IUser } from "./properties";

@Injectable()
export class ChatDAO {
  constructor (
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Channels)
    private channelRepo: Repository<Channels>,
    @InjectRepository(Messages)
    private messsageRepo: Repository<Messages>,
  ) {}

  public saveMessageToChannel(message: IMessage, channelId: number): void {

  }

  public saveChannel(title: string, user: IUser, firstMessage?: IMessage): void {

  }

  public async getChannelIdbyTitle(title: string): Promise<number> {
    return 0;
  }

  public async getChannelMessages(channelId: number): Promise<Messages[]> {
    return [];
  }

  public async getRawChannelMessages(channelId: number): Promise<string[]> {
    const data: Messages[] = await this.getChannelMessages(channelId);
    return data.map((item) => { return item.content; })
  }

  public async getUserChannels(userId: number): Promise<Channels[]> {
    return [];
  }

  public async getRawUserChannels(userId: number): Promise<string[]> {
    const data: Channels[] = await this.getUserChannels(userId);
    return data.map((item) => { return item.title; })
  }

  //getChannelOwner
  //updateUserRole
  //getMessagesFiltert
}
