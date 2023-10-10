import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { GamesService } from './games.service';
import { IGame, IPaddle, IGameSocketPayload } from './properties';

@WebSocketGateway(6969, {
  cors: {
    origin: ['http://localhost:3000'],
    // credentials: true,
  },
})
export class GamesGateway {
  constructor(private gamesService: GamesService) {
    setInterval(() => {
      console.log(`Amount of Games: ${this.gamesService.amountOfGammes}`);
      console.log(`${this.gamesService.games}`);
    }, 5000);
  }
  @SubscribeMessage('gamestate')
  gamestate(@MessageBody() body: IGameSocketPayload): IGame {
    return this.gamesService.gamestate(body.paddle, body.gameId);
  }

  @SubscribeMessage('start')
  startGameLoop(): number {
    console.log('Start game Loop');
    return this.gamesService.startGameLoop();
  }

  @SubscribeMessage('stopall')
  stopAll(): void {
    console.log('Stop game Loop');
    this.gamesService.stopAll();
  }

  @SubscribeMessage('stop')
  stop(@MessageBody() gameId: number): void {
    console.log('Stop game Loop');
    this.gamesService.stop(gameId);
  }
}
