import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { GamesService } from './games.service';
import { IGame, IGameSocketPayload } from './properties';

@WebSocketGateway(6969, {})
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
}
