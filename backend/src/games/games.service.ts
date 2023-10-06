import { Injectable } from '@nestjs/common';
import properties, { IBall, ballSpawn, IGame, IPaddleBackend } from './properties';



@Injectable()
export class GamesService {
  constructor() {
    this.game = {
      gameid: 0,
      ball: {
        x: ballSpawn.x,
        y: ballSpawn.y,
        speed_x: ballSpawn.speed_x,
        speed_y: ballSpawn.speed_y,
      },
      left : {
        height: 320,
        side: 'left',
      },
      right : {
        height: 320,
        side: 'right',
      },
    };
    this.intervals = [];
  }

  public game: IGame;
  public intervals: NodeJS.Timeout[];

  stop(): void {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    const newIntervals: NodeJS.Timeout[] = [];
    this.intervals = newIntervals;
  }

  async ball(side: string, height: number): Promise<IGame> {
    if (side === 'left')
    this.game.left = {side: 'left', height: height}
    if (side === 'right')
    this.game.right = {side: 'right', height: height}
    return this.game;
  }

  public startGameLoop(): number {
    const interval = setInterval(() => {
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
    }, properties.framerate);
    this.intervals.push(interval);
    return this.game.gameid;
  }
}
