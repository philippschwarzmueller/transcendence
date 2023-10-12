import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { GamesService } from './games.service';
import { IGame, IGameSocketPayload } from './properties';
import { Socket } from 'dgram';

@WebSocketGateway(6969, {
  cors: {
    credentials: true,
  },
})
export class GamesGateway {
  constructor(private gamesService: GamesService) {}
  @SubscribeMessage('gamestate')
  gamestate(@MessageBody() body: IGameSocketPayload): IGame {
    return this.gamesService.gamestate(body.paddle, body.gameId);
  }

  @SubscribeMessage('start')
  startGameLoop(): number {
    return this.gamesService.startGameLoop();
  }

  @SubscribeMessage('stopall')
  stopAll(): void {
    this.gamesService.stopAll();
  }

  @SubscribeMessage('stop')
  stop(@MessageBody() gameId: number): void {
    this.gamesService.stop(gameId);
  }

  @SubscribeMessage('queue')
  queue(@MessageBody() body: string, @ConnectedSocket() client: Socket): void {
    this.gamesService.queue(body, client);
  }
}
