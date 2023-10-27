import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { GamesService } from './games.service';
import { IFinishedGame, IGame, IGameSocketPayload, IUser } from './properties';
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
    @MessageBody() user: IUser,
    @ConnectedSocket() client: Socket,
  ): void {
    this.gamesService.queue(user, client);
  }

  @SubscribeMessage('getGameData')
  public getGameData(@MessageBody() gameId: string): IGame {
    return this.gamesService.getGameData(gameId);
  }

  @SubscribeMessage('isGameRunning')
  public isGameRunning(@MessageBody() gameId: string): boolean {
    return this.gamesService.isGameRunning(gameId);
  }

  @SubscribeMessage('isGameinDatabase')
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
