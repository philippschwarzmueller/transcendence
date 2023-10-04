import { Injectable } from '@nestjs/common';
import properties from './properties';

interface IBall {
  x: number;
  y: number;
  speed_x: number;
  speed_y: number;
}
interface IGame {
  gameid: number;
  ball: IBall;
}

@Injectable()
export class GamesService {
  constructor() {
    this.game = { gameid: 0, ball: { x: 200, y: 200, speed_x: 5, speed_y: 5 } };
  }

  public game: IGame;

  async ball(): Promise<IBall> {
    return this.game.ball;
  }

  public StartGameLoop() {
    setInterval(() => {
      if (
        this.game.ball.x + this.game.ball.speed_x > properties.window.width ||
        this.game.ball.x + this.game.ball.speed_x < 0
      )
        this.game.ball.speed_x *= -1;
      if (
        this.game.ball.y + this.game.ball.speed_y > properties.window.height ||
        this.game.ball.y + this.game.ball.speed_y < 0
      )
        this.game.ball.speed_y *= -1;
      this.game.ball.x += this.game.ball.speed_x;
      this.game.ball.y += this.game.ball.speed_y;
    }, 100);
    return this.game.gameid;
  }
}
