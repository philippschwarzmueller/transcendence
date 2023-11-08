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
} from '../games/properties';

import { IMessage } from '../chat/properties';
import { Socket, Server } from 'socket.io';
import { GamesService } from '../games/games.service';
import { ChatService } from 'src/chat/chat.service';
import { Inject, Injectable } from '@nestjs/common';

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
  ) {
  }


  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  async message(@MessageBody() data: IMessage): Promise<void> {
    this.chatService.handleMessage(data, this.server, this.gamesService);
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() data: IMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<string[]> {
    return await this.chatService.joinRoom(data, client);
  }

  @SubscribeMessage('create')
  async addChat(
    @MessageBody() data: IMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<string[]> {
    const ehre = await this.chatService.addChat(
      data.user.name,
      data.room,
      client,
    );
    return ehre;
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

  afterInit(server: any): any {}
}
