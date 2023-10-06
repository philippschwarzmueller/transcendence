import { Injectable } from '@nestjs/common';
import properties, { ballSpawn, gameSpawn, IGame } from './properties';

const newGame = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

@Injectable()
export class GamesService {
  constructor() {
    this.game = [newGame()];
    this.intervals = [];
    this.amountOfGammes = 0;
  }

  public amountOfGammes: number;
  public game: IGame[];
  public intervals: NodeJS.Timeout[];

  stopAll(): void {
    this.game = [newGame()];
    this.amountOfGammes = 0;
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals = [];
  }

  stop(gameId: number): void {
    clearInterval(this.intervals[gameId]);
  }

  async gamestate(
    side: string,
    height: number,
    gameId: number,
  ): Promise<IGame> {
    if (this.amountOfGammes === 0) return newGame();
    if (side === 'left')
      this.game[gameId].left = { side: 'left', height: height };
    if (side === 'right')
      this.game[gameId].right = { side: 'right', height: height };
    this.game[gameId].gameid = gameId;
    return this.game[gameId];
  }

  public startGameLoop(): number {
    this.game.push(newGame());
    const gameId: number = this.amountOfGammes;
    this.amountOfGammes++;
    const interval = setInterval(() => {
      if (
        this.game[gameId].ball.x + this.game[gameId].ball.speed_x >
          properties.window.width ||
        this.game[gameId].ball.x + this.game[gameId].ball.speed_x < 0
      )
        this.game[gameId].ball.speed_x *= -1;
      if (
        this.game[gameId].ball.y + this.game[gameId].ball.speed_y >
          properties.window.height ||
        this.game[gameId].ball.y + this.game[gameId].ball.speed_y < 0
      )
        this.game[gameId].ball.speed_y *= -1;
      this.game[gameId].ball.x += this.game[gameId].ball.speed_x;
      this.game[gameId].ball.y += this.game[gameId].ball.speed_y;
    }, properties.framerate);
    this.intervals.push(interval);
    return gameId;
  }
}
