import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IGameBackend,
  IGameUser,
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
    this.gameStorage = new Map<string, IGameBackend>();
    this.amountOfGammes = 0;
    this.clients = [];
  }

  public amountOfGammes: number;
  public gameStorage: Map<string, IGameBackend>;
  public clients: IGameUser[];

  private generateGameId(): string {
    return `${this.amountOfGammes}`;
  }

  stopAll(): void {
    this.gameStorage.forEach((game) => {
      if (game.interval !== undefined) clearInterval(game.interval);
    });
    this.gameStorage.clear();
    this.amountOfGammes = 0;
  }

  stop(gameId: string): void {
    if (this.gameStorage.get(gameId).interval !== undefined)
      clearInterval(this.gameStorage.get(gameId).interval);
  }

  gamestate(
    side: string,
    keystate: IKeyState,
    gameId: string,
    userId: string | null,
  ): IGame {
    if (this.amountOfGammes <= 0) return newGameCopy();
    if (!this.gameStorage.has(gameId)) return newGameCopy();
    // reimplement the next line if you want to force users to be logged in
    // right now as comment for testing
    // if (userId === null) return this.games.get(gameId).game;
    if (
      side === 'left' &&
      userId === this.gameStorage.get(gameId).leftPlayer.userId
    )
      this.gameStorage.get(gameId).gameState.keyStateLeft = keystate;
    else if (
      side === 'right' &&
      userId === this.gameStorage.get(gameId).rightPlayer.userId
    )
      this.gameStorage.get(gameId).gameState.keyStateRight = keystate;
    return this.gameStorage.get(gameId).gameState;
  }

  private GameLoop(localGame: IGameBackend): void {
    movePaddle(
      localGame.gameState.keyStateLeft,
      localGame.gameState.leftPaddle,
    );
    movePaddle(
      localGame.gameState.keyStateRight,
      localGame.gameState.rightPaddle,
    );
    const newBall: IBall = advanceBall(localGame.gameState.ball);
    if (ballHitPaddle(newBall, localGame.gameState.rightPaddle)) {
      // hit right paddle
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle);
    } else if (newBall.x > properties.window.width) {
      // missed right paddle
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsLeft++;
    } else if (ballHitPaddle(newBall, localGame.gameState.leftPaddle)) {
      // hit left paddle
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle);
    } else if (newBall.x < 0) {
      // missed left paddle
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsRight++;
    } else if (newBall.y > properties.window.height || newBall.y < 0) {
      //collision on top/botton
      localGame.gameState.ball.speed_y *= -1;
    }
    localGame.gameState.ball = advanceBall(localGame.gameState.ball); // actually moving ball
    if (
      localGame.gameState.pointsLeft >= maxScore ||
      localGame.gameState.pointsRight >= maxScore
    ) {
      this.stop(localGame.gameId);
      localGame.leftPlayer.socket.emit('endgame');
      localGame.rightPlayer.socket.emit('endgame');
    }
  }

  public startGameLoop(leftPlayer: IGameUser, rightPlayer: IGameUser): string {
    const newGame: IGame = newGameCopy();
    const gameId: string = this.generateGameId();
    newGame.gameId = gameId;
    this.gameStorage.set(gameId, {
      gameId: gameId,
      spectatorSockets: [],
      gameState: newGame,
      leftPlayer: leftPlayer,
      rightPlayer: rightPlayer,
    });
    this.amountOfGammes++;
    const interval = setInterval(
      this.GameLoop.bind(this),
      properties.framerate,
      this.gameStorage.get(gameId),
    );
    this.gameStorage.get(gameId).interval = interval;
    return gameId;
  }

  public queue(body: string, client: Socket): void {
    this.clients.push({ userId: body, socket: client });
    if (this.clients.length >= 2) {
      const newGameId: string = this.startGameLoop(
        this.clients[0],
        this.clients[1],
      );
      this.clients[0].socket.emit('queue found', {
        gameId: newGameId,
        side: 'left',
      });
      this.clients[1].socket.emit('queue found', {
        gameId: newGameId,
        side: 'right',
      });
      this.clients.splice(0, 2);
    }
  }
}
