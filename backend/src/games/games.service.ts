import { Injectable } from '@nestjs/common';
import properties, { gameSpawn, IGame, IPaddleBackend } from './properties';

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

  public startGameLoop(): number {
    const newGame: IGame = newGameCopy();
    const gameId: number = this.amountOfGammes;
    newGame.gameId = gameId;
    this.games.push(newGame);
    this.amountOfGammes++;
    const interval = setInterval(() => {
      if (
        this.games[gameId].ball.x + this.games[gameId].ball.speed_x >
          properties.window.width ||
        this.games[gameId].ball.x + this.games[gameId].ball.speed_x < 0
      )
        this.games[gameId].ball.speed_x *= -1;
      if (
        this.games[gameId].ball.y + this.games[gameId].ball.speed_y >
          properties.window.height ||
        this.games[gameId].ball.y + this.games[gameId].ball.speed_y < 0
      )
        this.games[gameId].ball.speed_y *= -1;
      this.games[gameId].ball.x += this.games[gameId].ball.speed_x;
      this.games[gameId].ball.y += this.games[gameId].ball.speed_y;
    }, properties.framerate);
    this.intervals.push(interval);
    return gameId;
  }
}
