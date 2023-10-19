import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  gameSpawn,
  IBall,
  IGame,
  IGameBackend,
  IGameUser,
  IKeyState,
  IUser,
  maxScore,
} from './properties';
import {
  advanceBall,
  ballHitPaddle,
  bounceOnPaddle,
  movePaddle,
} from './games.gamelogic';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';

const newGameCopy = (): IGame => {
  return JSON.parse(JSON.stringify(gameSpawn));
};

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>, // private configService: ConfigService,
  ) {
    this.gameStorage = new Map<string, IGameBackend>();
    this.amountOfGammes = 0;
    this.clients = [];
  }

  public amountOfGammes: number;
  public gameStorage: Map<string, IGameBackend>;
  public clients: IGameUser[];

  private async generateGameId(): Promise<string> {
    const newGame = this.gamesRepository.create({ isFinished: false });
    await this.gamesRepository.save(newGame); // This inserts the new game and assigns an ID

    return `${newGame.gameId}`;
  }

  private stop(gameId: string): void {
    if (this.gameStorage.get(gameId).interval !== undefined)
      clearInterval(this.gameStorage.get(gameId).interval);
  }

  public alterGameData(
    side: string,
    keystate: IKeyState,
    gameId: string,
    user: IUser,
  ): IGame {
    if (this.amountOfGammes <= 0) return newGameCopy();
    if (!this.gameStorage.has(gameId)) return newGameCopy();
    // reimplement the next line if you want to force users to be logged in
    // right now as comment for testing
    // if (userId === null) return this.games.get(gameId).game;
    if (
      side === 'left' &&
      user.id === this.gameStorage.get(gameId).leftPlayer.user.id
    )
      this.gameStorage.get(gameId).gameState.keyStateLeft = keystate;
    else if (
      side === 'right' &&
      user.id === this.gameStorage.get(gameId).rightPlayer.user.id
    )
      this.gameStorage.get(gameId).gameState.keyStateRight = keystate;
    return this.gameStorage.get(gameId).gameState;
  }

  private async GameLoop(localGame: IGameBackend): Promise<void> {
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
      localGame.gameState.isFinished = true;
      const winner: IUser =
        localGame.gameState.pointsLeft === maxScore
          ? localGame.leftPlayer.user
          : localGame.rightPlayer.user;
      const looser: IUser =
        localGame.gameState.pointsLeft !== maxScore
          ? localGame.leftPlayer.user
          : localGame.rightPlayer.user;
      localGame.gameState.winner = winner;
      localGame.gameState.looser = looser;
      const winnerPoints = Math.max(
        localGame.gameState.pointsLeft,
        localGame.gameState.pointsRight,
      );
      const looserPoints = Math.min(
        localGame.gameState.pointsLeft,
        localGame.gameState.pointsRight,
      );
      localGame.leftPlayer.socket.emit('endgame');
      localGame.rightPlayer.socket.emit('endgame');

      const game = await this.gamesRepository.findOne({
        where: { gameId: parseInt(localGame.gameId) },
      });

      if (!game) return;
      const updatedData: Game = {
        gameId: parseInt(localGame.gameId),
        winner: winner != null && winner != undefined ? winner.name : 'null',
        looser: looser != null && winner != undefined ? winner.name : 'null',
        winnerPoints: winnerPoints,
        looserPoints: looserPoints,
        isFinished: true,
      };
      Object.assign(game, updatedData);
      await this.gamesRepository.save(game);
    }
  }

  public async startGameLoop(
    leftPlayer: IGameUser,
    rightPlayer: IGameUser,
  ): Promise<string> {
    const newGame: IGame = newGameCopy();
    const gameId: string = await this.generateGameId();
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

  public async queue(user: IUser, client: Socket): Promise<void> {
    this.clients.push({ user: user, socket: client });
    if (this.clients.length >= 2) {
      const newGameId: string = await this.startGameLoop(
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

  public getGameData(gameId: string): IGame {
    if (this.amountOfGammes <= 0) return newGameCopy();
    if (!this.gameStorage.has(gameId)) return newGameCopy();
    return this.gameStorage.get(gameId).gameState;
  }
}
