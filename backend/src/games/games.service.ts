import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IPaddle,
} from './properties';

const newGameCopy = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

const advanceBall = (oldBall: IBall): IBall => {
  const newBall: IBall = {
    x: oldBall.x + oldBall.speed_x,
    y: oldBall.y + oldBall.speed_y,
    speed_x: oldBall.speed_x,
    speed_y: oldBall.speed_y,
  };
  return newBall;
};

const bounceOnPaddle = (ball: IBall, paddle: IPaddle): IBall => {
  const paddleHalf: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100 / 2,
  );
  ball.speed_x *= -1; // turn around
  const deltaPaddle: number = ((paddle.height - ball.y) * 2) / paddleHalf;
  ball.speed_y = -Math.abs(ball.speed_x) * deltaPaddle; // y-direction change
  ball.speed_x *= properties.ballProperties.acceleration; // acceleration
  return ball;
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
    this.games[gameId] = newGameCopy();
  }

  async gamestate(paddle: IPaddle, gameId: number): Promise<IGame> {
    if (this.amountOfGammes === 0) return newGameCopy();
    if (paddle.side === 'left')
      this.games[gameId].left = { side: 'left', height: paddle.height };
    if (paddle.side === 'right')
      this.games[gameId].right = { side: 'right', height: paddle.height };
    this.games[gameId].gameId = gameId;
    return this.games[gameId];
  }

  private GameLoop(gameId: number): void {
    const paddleHalf: number = Math.floor(
      (properties.window.height * properties.paddle.height) / 100 / 2,
    );
    const newBall: IBall = advanceBall(this.games[gameId].ball);
    if (
      newBall.x >
        properties.window.width -
          properties.paddle.width -
          properties.ballProperties.radius &&
      newBall.y < this.games[gameId].right.height + paddleHalf &&
      newBall.y > this.games[gameId].right.height - paddleHalf
    ) {
      // hit paddle
      bounceOnPaddle(this.games[gameId].ball, this.games[gameId].right);
    } else if (newBall.x > properties.window.width) {
      // missed paddle
      this.games[gameId].ball = ballSpawn;
      this.games[gameId].pointsLeft++;
    }
    if (
      newBall.x < properties.paddle.width + properties.ballProperties.radius &&
      newBall.y < this.games[gameId].left.height + paddleHalf &&
      newBall.y > this.games[gameId].left.height - paddleHalf
    ) {
      // hit paddle
      bounceOnPaddle(this.games[gameId].ball, this.games[gameId].left);
    } else if (newBall.x > properties.window.width) {
      // missed paddle
      this.games[gameId].ball = ballSpawn;
      this.games[gameId].pointsRight++;
    }
    if (newBall.y > properties.window.height || newBall.y < 0) {
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
}
