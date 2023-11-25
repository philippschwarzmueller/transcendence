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
  IGameUser,
  IGameUserAuth,
  IQueuePayload,
} from '../games/properties';

import { IChannel, IMessage } from '../chat/properties';
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

  @SubscribeMessage('message')
  async message(@MessageBody() data: IMessage): Promise<void> {
    this.chatService.handleMessage(data, this.server, this.gamesService);
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() data: IChannel,
    @ConnectedSocket() client: Socket,
  ): Promise<string[]> {
    return await this.chatService.joinRoom(data, client, this.server);
  }

  @SubscribeMessage('create')
  async addChat(@MessageBody() data: IChannel): Promise<string[]> {
    return await this.chatService.addChat(data);
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
  public handleAccept(@MessageBody() intraname: string): void {
    return this.gamesService.handleAccept(intraname)
  }

  @SubscribeMessage('decline')
  public handleDecline(@MessageBody() intraname: string): void {
    return this.gamesService.handleDecline(intraname)
  }

  afterInit(server: any): any {}
}
