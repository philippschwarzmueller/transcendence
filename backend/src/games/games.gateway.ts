import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { GamesService } from './games.service';
import { IGame, IGameSocketPayload } from './properties';
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
    @MessageBody() body: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.gamesService.queue(body, client);
  }

  @SubscribeMessage('getGameData')
  public getGameData(@MessageBody() gameId: string): IGame {
    return this.gamesService.getGameData(gameId);
  }
}
