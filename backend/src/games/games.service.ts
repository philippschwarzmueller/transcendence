import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IKeyState,
} from './properties';
import {
  advanceBall,
  ballHitPaddle,
  bounceOnPaddle,
  movePaddle,
} from './games.gamelogic';
import { Socket } from 'dgram';

const newGameCopy = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

@Injectable()
export class GamesService {
  constructor() {
    this.games = []; // array with all gamedata
    this.intervals = []; // array with all gameloops (to kill them)
    this.amountOfGammes = 0;
    this.clients = [];
  }

  public amountOfGammes: number;
  public games: IGame[];
  public intervals: NodeJS.Timeout[];
  public clients: Socket[];

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

  gamestate(side: string, keystate: IKeyState, gameId: number): IGame {
    if (this.amountOfGammes <= 0) return newGameCopy();

    if (side === 'left') this.games[gameId].keyStateLeft = keystate;
    else if (side === 'right') this.games[gameId].keyStateRight = keystate;
    this.games[gameId].gameId = gameId;
    return this.games[gameId];
  }

  private GameLoop(gameId: number): void {
    movePaddle(this.games[gameId].keyStateLeft, this.games[gameId].left);
    movePaddle(this.games[gameId].keyStateRight, this.games[gameId].right);
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

  public queue(body: string, client: Socket): void {
    this.clients.push(client);
    if (this.clients.length >= 2) {
      const newGameId: number = this.startGameLoop();
      this.clients[0].emit('queue found', { gameId: newGameId, side: 'left' });
      this.clients[1].emit('queue found', { gameId: newGameId, side: 'right' });
      this.clients.splice(0, 2);
    }
  }
}
