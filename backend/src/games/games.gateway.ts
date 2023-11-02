import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { GamesService } from './games.service';
import {
  EGamemode,
  IFinishedGame,
  IGame,
  IGameSocketPayload,
  IQueuePayload,
  IUser,
} from './properties';
import { Socket } from 'socket.io';

@WebSocketGateway(6969, {
  cors: {
    credentials: true,
  },
})
export class GamesGateway {
  constructor(private gamesService: GamesService) {}

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
    console.log(payload);
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
}
