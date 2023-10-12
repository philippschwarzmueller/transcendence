import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IPaddle,
} from './properties';
import { advanceBall, ballHitPaddle, bounceOnPaddle } from './games.gamelogic';

const newGameCopy = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

@Injectable()
export class GamesService {
  constructor() {
    this.games = []; // array with all gamedata
    this.intervals = []; // array with all gameloops (to kill them)
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
  }

  gamestate(paddle: IPaddle, gameId: number): IGame {
    if (this.amountOfGammes <= 0) return newGameCopy();
    if (paddle.side === 'left')
      this.games[gameId].left = { side: 'left', height: paddle.height };
    if (paddle.side === 'right')
      this.games[gameId].right = { side: 'right', height: paddle.height };
    this.games[gameId].gameId = gameId;
    return this.games[gameId];
  }

  private GameLoop(gameId: number): void {
    const newBall: IBall = advanceBall(this.games[gameId].ball);
    if (ballHitPaddle(newBall, this.games[gameId].right)) {
      // hit right paddle
      bounceOnPaddle(this.games[gameId].ball, this.games[gameId].right);
    } else if (newBall.x > properties.window.width) {
      // missed right paddle
      this.games[gameId].ball = ballSpawn;
      this.games[gameId].pointsLeft++;
    } else if (ballHitPaddle(newBall, this.games[gameId].left)) {
      // hit left paddle
      bounceOnPaddle(this.games[gameId].ball, this.games[gameId].left);
    } else if (newBall.x < 0) {
      // missed left paddle
      this.games[gameId].ball = ballSpawn;
      this.games[gameId].pointsRight++;
    } else if (newBall.y > properties.window.height || newBall.y < 0) {
      //collision on top/botton
      this.games[gameId].ball.speed_y *= -1;
    }
    this.games[gameId].ball = advanceBall(this.games[gameId].ball); // actually moving ball
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

  public queue(body: string): number {
    return 0;
  }
}
