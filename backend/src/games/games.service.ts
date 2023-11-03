import { Injectable } from '@nestjs/common';
import properties, {
  ballSpawn,
  EGamemode,
  gameSpawn,
  IBall,
  IFinishedGame,
  IGame,
  IGameBackend,
  IGameUser,
  IKeyState,
  IUser,
} from './properties';
import {
  advanceBall,
  ballHitGoal,
  ballHitPaddle,
  ballhitSide2D,
  bounceOnPaddle,
  bounceOnSide,
  bounceOnTop,
  movePaddle1D,
  movePaddle2D,
} from './games.gamelogic';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { getWinnerLooser, isGameFinished } from './games.utils';

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
    this.clients = new Map([
      [EGamemode.standard, []],
      [EGamemode.roomMovement, []],
    ]);
    setInterval(() => {
      console.log(this.gameStorage.size, ' games running');
    }, 1000);
  }

  public amountOfGammes: number;
  public gameStorage: Map<string, IGameBackend>;
  public clients: Map<EGamemode, IGameUser[]>;

  private async generateGameId(
    leftPlayerName: string,
    rightPlayerName: string,
    gamemode: EGamemode,
  ): Promise<string> {
    const newGame = this.gamesRepository.create({
      isFinished: false,
      leftPlayer: leftPlayerName,
      rightPlayer: rightPlayerName,
      gamemode: gamemode,
    });
    await this.gamesRepository.save(newGame); // This inserts the new game and assigns an ID

    return `${newGame.gameId}`;
  }

  private stop(gameId: string): void {
    if (this.gameStorage.get(gameId).interval !== undefined)
      clearInterval(this.gameStorage.get(gameId).interval);
  }

  public async isGameInDatabase(gameId: string): Promise<boolean> {
    return await this.gamesRepository.exist({ where: { gameId: gameId } });
  }

  public isGameRunning(gameId: string): boolean {
    return this.gameStorage.has(gameId);
  }

  public async getGameFromDatabase(gameId: string): Promise<IFinishedGame> {
    const databaseGame: Game = await this.gamesRepository.findOne({
      where: { gameId: gameId },
    });
    const returnGame: IFinishedGame = { gameExists: true };
    if (!databaseGame) {
      returnGame.gameExists = false;
      return returnGame;
    }

    returnGame.winner = databaseGame.winner;
    returnGame.looser = databaseGame.looser;
    returnGame.winnerPoints = databaseGame.winnerPoints;
    returnGame.looserPoints = databaseGame.looserPoints;
    return returnGame;
  }

  public alterGameData(
    side: string,
    keystate: IKeyState,
    gameId: string,
    user: IUser,
  ): IGame {
    if (!this.isGameRunning(gameId)) return newGameCopy();
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

  private async GameLoop1D(localGame: IGameBackend): Promise<void> {
    movePaddle1D(
      localGame.gameState.keyStateLeft,
      localGame.gameState.leftPaddle,
    );
    movePaddle1D(
      localGame.gameState.keyStateRight,
      localGame.gameState.rightPaddle,
    );

    const newBall: IBall = advanceBall(localGame.gameState.ball);
    if (
      ballHitPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle)
    ) {
      // hit right paddle
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle);
    } else if (
      ballHitPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle)
    ) {
      // hit left paddle
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle);
    } else if (newBall.x > properties.window.width) {
      // missed right paddle
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsLeft++;
    } else if (newBall.x < 0) {
      // missed left paddle
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsRight++;
    } else if (newBall.y > properties.window.height || newBall.y < 0) {
      //collision on top/botton
      localGame.gameState.ball.speed_y *= -1;
    }

    // actually moving ball
    localGame.gameState.ball = advanceBall(localGame.gameState.ball);

    // check if game is done, and finish it
    if (isGameFinished(localGame)) await this.cleanUpFinishedGame(localGame);
  }

  private async GameLoop2D(localGame: IGameBackend): Promise<void> {
    const newBall: IBall = advanceBall(localGame.gameState.ball);
    movePaddle2D(
      localGame.gameState.keyStateLeft,
      localGame.gameState.leftPaddle,
    );
    movePaddle2D(
      localGame.gameState.keyStateRight,
      localGame.gameState.rightPaddle,
    );
    if (
      ballHitPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle)
    ) {
      // hit right paddle
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle);
    } else if (
      ballHitPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle)
    ) {
      // hit left paddle
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle);
    } else if (ballHitGoal(newBall) === 'right') {
      // missed right paddle
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsLeft++;
    } else if (ballHitGoal(newBall) === 'left') {
      // missed left paddle
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsRight++;
    } else if (ballhitSide2D(newBall)) {
      bounceOnSide(localGame.gameState.ball);
    } else if (newBall.y > properties.window.height || newBall.y < 0) {
      //collision on top/botton
      bounceOnTop(localGame.gameState.ball);
    }

    // actually moving ball
    localGame.gameState.ball = advanceBall(localGame.gameState.ball);

    // check if game is done, and finish it
    if (isGameFinished(localGame)) await this.cleanUpFinishedGame(localGame);
  }

  public async startGameLoop(
    leftPlayer: IGameUser,
    rightPlayer: IGameUser,
    gamemode: EGamemode,
  ): Promise<string> {
    const newGame: IGame = newGameCopy();
    const gameId: string = await this.generateGameId(
      leftPlayer.user.name,
      rightPlayer.user.name,
      gamemode,
    );
    newGame.gameId = gameId;
    this.gameStorage.set(gameId, {
      gameId: gameId,
      spectatorSockets: [],
      gameState: newGame,
      leftPlayer: leftPlayer,
      rightPlayer: rightPlayer,
    });
    this.amountOfGammes++;
    if (gamemode === EGamemode.standard) {
      const interval = setInterval(
        this.GameLoop1D.bind(this),
        properties.framerate,
        this.gameStorage.get(gameId),
      );
      this.gameStorage.get(gameId).interval = interval;
    } else if (gamemode === EGamemode.roomMovement) {
      const interval = setInterval(
        this.GameLoop2D.bind(this),
        properties.framerate,
        this.gameStorage.get(gameId),
      );
      this.gameStorage.get(gameId).interval = interval;
    }
    return gameId;
  }

  public async queue(
    user: IUser,
    gamemode: EGamemode,
    client: Socket,
  ): Promise<void> {
    this.clients.get(gamemode).push({ user: user, socket: client });
    if (this.clients.get(gamemode).length >= 2) {
      const newGameId: string = await this.startGameLoop(
        this.clients.get(gamemode)[0],
        this.clients.get(gamemode)[1],
        gamemode,
      );
      this.clients.get(gamemode)[0].socket.emit('queue found', {
        gameId: newGameId,
        side: 'left',
      });
      this.clients.get(gamemode)[1].socket.emit('queue found', {
        gameId: newGameId,
        side: 'right',
      });
      //remember to later delete user form other queues
      this.clients.get(gamemode).splice(0, 2);
    }
  }

  public getGameData(gameId: string): IGame {
    if (!this.isGameRunning) return newGameCopy();
    return this.gameStorage.get(gameId).gameState;
  }

  private async cleanUpFinishedGame(localGame: IGameBackend): Promise<void> {
    this.stop(localGame.gameId);
    localGame.gameState.isFinished = true;
    const [winner, looser] = getWinnerLooser(localGame);
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

    const databaseGame = await this.gamesRepository.findOne({
      where: { gameId: localGame.gameId },
    });

    if (!databaseGame) return;
    const updatedDatabaseGame: CreateGameDto = {
      gameId: localGame.gameId,
      winner:
        winner != null &&
        winner != undefined &&
        winner.name != '' &&
        winner.name != undefined &&
        winner.name != null
          ? winner.name
          : 'null',
      looser:
        looser != null &&
        looser != undefined &&
        looser.name != '' &&
        looser.name != undefined &&
        looser.name != null
          ? looser.name
          : 'null',
      winnerPoints: winnerPoints,
      looserPoints: looserPoints,
      isFinished: true,
    };
    await this.gamesRepository.update(localGame.gameId, updatedDatabaseGame);
    this.gameStorage.delete(localGame.gameId);
  }
}
