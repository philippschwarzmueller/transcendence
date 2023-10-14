import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IGameBackend,
  IKeyState,
  maxScore,
} from './properties';
import {
  advanceBall,
  ballHitPaddle,
  bounceOnPaddle,
  movePaddle,
} from './games.gamelogic';
import { Socket } from 'socket.io';

const newGameCopy = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

@Injectable()
export class GamesService {
  constructor() {
    this.games = new Map<string, IGameBackend>();
    this.amountOfGammes = 0;
    this.clients = [];
  }

  public amountOfGammes: number;
  public games: Map<string, IGameBackend>;
  public clients: Socket[];

  private generateGameId(): string {
    return `${this.amountOfGammes}`;
  }

  stopAll(): void {
    this.games.forEach((game) => {
      if (game.interval !== undefined) clearInterval(game.interval);
    });
    this.games.clear();
    this.amountOfGammes = 0;
  }

  stop(gameId: number): void {
    if (this.games.get(`${gameId}`).interval !== undefined)
      clearInterval(this.games.get(`${gameId}`).interval);
  }

  gamestate(side: string, keystate: IKeyState, gameId: number): IGame {
    if (this.amountOfGammes <= 0) return newGameCopy();

    if (side === 'left')
      this.games.get(`${gameId}`).game.keyStateLeft = keystate;
    else if (side === 'right')
      this.games.get(`${gameId}`).game.keyStateRight = keystate;
    return this.games.get(`${gameId}`).game;
  }

  private GameLoop(game: IGameBackend): void {
    movePaddle(game.game.keyStateLeft, game.game.left);
    movePaddle(game.game.keyStateRight, game.game.right);
    const newBall: IBall = advanceBall(game.game.ball);
    if (ballHitPaddle(newBall, game.game.right)) {
      // hit right paddle
      bounceOnPaddle(game.game.ball, game.game.right);
    } else if (newBall.x > properties.window.width) {
      // missed right paddle
      game.game.ball = ballSpawn;
      game.game.pointsLeft++;
    } else if (ballHitPaddle(newBall, game.game.left)) {
      // hit left paddle
      bounceOnPaddle(game.game.ball, game.game.left);
    } else if (newBall.x < 0) {
      // missed left paddle
      game.game.ball = ballSpawn;
      game.game.pointsRight++;
    } else if (newBall.y > properties.window.height || newBall.y < 0) {
      //collision on top/botton
      game.game.ball.speed_y *= -1;
    }
    game.game.ball = advanceBall(game.game.ball); // actually moving ball
    if (game.game.pointsLeft >= maxScore || game.game.pointsRight >= maxScore) {
      this.stop(Number(game.gameId));
      game.leftPlayer.socket.emit('endgame');
      game.rightPlayer.socket.emit('endgame');
    }
  }

  public startGameLoop(leftPlayer: Socket, rightPlayer: Socket): string {
    const newGame: IGame = newGameCopy();
    const gameId: string = this.generateGameId();
    newGame.gameId = gameId;
    this.games.set(gameId, {
      gameId: gameId,
      spectatorSockets: [],
      game: newGame,
      leftPlayer: { userId: 'left', socket: leftPlayer },
      rightPlayer: { userId: 'right', socket: rightPlayer },
    });
    this.amountOfGammes++;
    const interval = setInterval(
      this.GameLoop.bind(this),
      properties.framerate,
      this.games.get(`${gameId}`),
    );
    this.games.get(`${gameId}`).interval = interval;
    return gameId;
  }

  public queue(body: string, client: Socket): void {
    this.clients.push(client);
    if (this.clients.length >= 2) {
      const newGameId: string = this.startGameLoop(
        this.clients[0],
        this.clients[1],
      );
      this.clients[0].emit('queue found', { gameId: newGameId, side: 'left' });
      this.clients[1].emit('queue found', { gameId: newGameId, side: 'right' });
      this.clients.splice(0, 2);
    }
  }
}
