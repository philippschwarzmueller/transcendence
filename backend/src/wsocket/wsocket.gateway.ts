import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  EGamemode,
  IFinishedGame,
  IGame,
  IGameSocketPayload,
  IQueuePayload,
  IUser,
} from '../games/properties';

import { EChannelType, IChannel, IMessage, ITab, ISendMessage } from '../chat/properties';
import { Socket, Server } from 'socket.io';
import { GamesService } from '../games/games.service';
import { ChatService } from 'src/chat/chat.service';
import { Inject, Injectable } from '@nestjs/common';

export interface IChangeSocketPayload {
  intraname: string;
}

@Injectable()
@WebSocketGateway(9000, {
  cors: {
    credentials: true,
  },
})
export class WSocketGateway implements OnGatewayInit {
  constructor(
    @Inject(GamesService)
    private gamesService: GamesService,
    @Inject(ChatService)
    private chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('channel')
  async getChannels(@MessageBody() user: IUser): Promise<IChannel[]> {
    return await this.chatService.getChannelList(user);
  }
  @SubscribeMessage('contact')
  initConnect(
    @MessageBody() data: IChannel,
    @ConnectedSocket() client: Socket,
  ) {
    this.chatService.updateActiveClients(data, client);
  }

  @SubscribeMessage('layoff')
  breakConnection(@MessageBody() name: string) {
    this.chatService.removeUser(name);
  }

  @SubscribeMessage('message')
  async message(@MessageBody() data: IMessage): Promise<void> {
    this.chatService.handleMessage(data, this.server, this.gamesService);
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() data: IChannel,
    @ConnectedSocket() client: Socket,
  ): Promise<ISendMessage[]> {
    return await this.chatService.joinRoom(data, client, this.server);
  }

  @SubscribeMessage('create')
  async addChat(@MessageBody() data: IChannel): Promise<ITab[]> {
    if (data.type !== EChannelType.CHAT)
      return await this.chatService.addChat(data);
    return await this.chatService.addU2UChat(data, this.server);
  }

  @SubscribeMessage('challenge')
  challenge(@MessageBody() data: {challenger: IUser, challenged: IUser}) {
    this.chatService.gameInviteButton(data.challenger, data.challenged, this.server);
  }

  @SubscribeMessage('acceptgame')
  accept(@MessageBody() data: {challenger: IUser, challenged: IUser}) {
    this.chatService.gameAcceptButton(data.challenger, data.challenged, this.server, this.gamesService);
  }

  @SubscribeMessage('declinegame')
  decline(@MessageBody() data: IUser) {
    this.chatService.opponents.delete(data.intraname);
  }

  @SubscribeMessage('alterGameData')
  public alterGameData(@MessageBody() payload: IGameSocketPayload): IGame {
    return this.gamesService.alterGameData(
      payload.side,
      payload.keystate,
      payload.gameId,
      payload.user,
    );
  }

  @SubscribeMessage('queue')
  public queue(
    @MessageBody() payload: IQueuePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.gamesService.queue(payload.user, payload.gamemode, client);
  }

  @SubscribeMessage('getGameData')
  public getGameData(@MessageBody() gameId: string): IGame {
    return this.gamesService.getGameData(gameId);
  }

  @SubscribeMessage('getChannelUser')
  async getChannelUser(@MessageBody() channelId: number): Promise<IUser[]> {
    return await this.chatService.getUserInChannelList(channelId);
  }

  @SubscribeMessage('isGameRunning')
  public isGameRunning(@MessageBody() gameId: string): boolean {
    return this.gamesService.isGameRunning(gameId);
  }

  @SubscribeMessage('isGameInDatabase')
  public async isGameinDatabase(
    @MessageBody() gameId: string,
  ): Promise<boolean> {
    return await this.gamesService.isGameInDatabase(gameId);
  }

  @SubscribeMessage('getGameFromDatabase')
  public async getGameFromDatabase(
    @MessageBody() gameId: string,
  ): Promise<IFinishedGame> {
    return await this.gamesService.getGameFromDatabase(gameId);
  }

  @SubscribeMessage('getGamemode')
  public getGamemode(
    @MessageBody() gameId: string,
  ): EGamemode | undefined | null {
    return this.gamesService.getGamemode(gameId);
  }

  @SubscribeMessage('changesocket')
  public changeSocket(
    @MessageBody() gameuser: IChangeSocketPayload,
    @ConnectedSocket() socket: Socket,
  ): void {
    return this.gamesService.changeSocket(gameuser, socket);
  }

  @SubscribeMessage('isplayerinqueue')
  public isPlayerInQueue(
    @MessageBody() gameuser: IChangeSocketPayload,
  ): boolean {
    return this.gamesService.isPlayerInQueue(gameuser);
  }

  @SubscribeMessage('leavequeue')
  public leaveQueue(@MessageBody() gameuser: IChangeSocketPayload): void {
    return this.gamesService.leaveQueue(gameuser);
  }

  @SubscribeMessage('accept')
  public async handleAccept(@MessageBody() intraname: string): Promise<void> {
    return await this.gamesService.handleAccept(intraname);
  }

  @SubscribeMessage('decline')
  public handleDecline(@MessageBody() intraname: string): void {
    return this.gamesService.handleDecline(intraname);
  }

  afterInit(server: any): any {}
}
