import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IPaddleBackend,
} from './properties';

const newGameCopy = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

@Injectable()
export class GamesService {
  constructor() {
    this.games = [];
    this.intervals = [];
    this.amountOfGammes = 0;
  }

  public amountOfGammes: number;
  public games: IGame[];
  public intervals: NodeJS.Timeout[];

  stopAll(): void {
    this.games = [];
    this.amountOfGammes = 0;
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals = [];
  }

  stop(gameId: number): void {
    clearInterval(this.intervals[gameId]);
    this.games[gameId] = newGameCopy();
  }

  async gamestate(paddle: IPaddleBackend, gameId: number): Promise<IGame> {
    if (this.amountOfGammes === 0) return newGameCopy();
    if (paddle.side === 'left')
      this.games[gameId].left = { side: 'left', height: paddle.height };
    if (paddle.side === 'right')
      this.games[gameId].right = { side: 'right', height: paddle.height };
    this.games[gameId].gameId = gameId;
    return this.games[gameId];
  }

  private advanceBall(oldBall: IBall): IBall {
    const newBall: IBall = {
      x: oldBall.x + oldBall.speed_x,
      y: oldBall.y + oldBall.speed_y,
      speed_x: oldBall.speed_x,
      speed_y: oldBall.speed_y,
    };
    return newBall;
  }

  private GameLoop(gameId: number): void {
    const paddleHalf: number = Math.floor(
      (properties.window.height * properties.paddle.height) / 100 / 2,
    );
    const newBall: IBall = this.advanceBall(this.games[gameId].ball);
    if (newBall.x > properties.window.width) {
      if (
        newBall.y > this.games[gameId].right.height + paddleHalf ||
        newBall.y < this.games[gameId].right.height - paddleHalf
      )
        this.games[gameId].ball = ballSpawn;
      else this.games[gameId].ball.speed_x *= -1;
    }
    if (newBall.x < 0) {
      if (
        newBall.y > this.games[gameId].left.height + paddleHalf ||
        newBall.y < this.games[gameId].left.height - paddleHalf
      )
        this.games[gameId].ball = ballSpawn;
      else this.games[gameId].ball.speed_x *= -1;
    }
    if (newBall.y > properties.window.height || newBall.y < 0) {
      this.games[gameId].ball.speed_y *= -1;
    }
    this.games[gameId].ball = this.advanceBall(this.games[gameId].ball);
  }

  public startGameLoop(): number {
    const newGame: IGame = newGameCopy();
    const gameId: number = this.amountOfGammes;
    newGame.gameId = gameId;
    this.games.push(newGame);
    this.amountOfGammes++;
    const interval = setInterval(
      this.GameLoop.bind(this),
      properties.framerate,
      gameId,
    );
    this.intervals.push(interval);
    return gameId;
  }
}
