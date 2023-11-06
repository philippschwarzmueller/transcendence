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
  IPaddle,
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
  movingPaddleHitsBall,
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
    this.runningGames = new Map<string, IGameBackend>();
    this.queuedClients = new Map([
      [EGamemode.standard, new Map()],
      [EGamemode.roomMovement, new Map()],
    ]);
  }

  public runningGames: Map<string, IGameBackend>;
  public queuedClients: Map<EGamemode, Map<string, IGameUser>>;

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
    if (this.runningGames.get(gameId).interval !== undefined)
      clearInterval(this.runningGames.get(gameId).interval);
  }

  public async isGameInDatabase(gameId: string): Promise<boolean> {
    return await this.gamesRepository.exist({ where: { gameId: gameId } });
  }

  public isGameRunning(gameId: string): boolean {
    return this.runningGames.has(gameId);
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
    if (
      side === 'left' &&
      user.id === this.runningGames.get(gameId).leftPlayer.user.id
    )
      this.runningGames.get(gameId).gameState.keyStateLeft = keystate;
    else if (
      side === 'right' &&
      user.id === this.runningGames.get(gameId).rightPlayer.user.id
    )
      this.runningGames.get(gameId).gameState.keyStateRight = keystate;
    return this.runningGames.get(gameId).gameState;
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
      bounceOnTop(localGame.gameState.ball);
    }

    // actually moving ball
    localGame.gameState.ball = advanceBall(localGame.gameState.ball);

    // check if game is done, and finish it
    if (isGameFinished(localGame)) await this.cleanUpFinishedGame(localGame);
  }

  private async GameLoop2D(localGame: IGameBackend): Promise<void> {
    const oldPaddleLeft: IPaddle = { ...localGame.gameState.leftPaddle };
    const oldPaddleRight: IPaddle = { ...localGame.gameState.rightPaddle };
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
      movingPaddleHitsBall(
        localGame.gameState.ball,
        localGame.gameState.leftPaddle,
        oldPaddleLeft,
      )
    )
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle);
    else if (
      movingPaddleHitsBall(
        localGame.gameState.ball,
        localGame.gameState.rightPaddle,
        oldPaddleRight,
      )
    )
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle);
    else if (
      ballHitPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle)
    ) {
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.rightPaddle);
    } else if (
      ballHitPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle)
    ) {
      bounceOnPaddle(localGame.gameState.ball, localGame.gameState.leftPaddle);
    } else if (ballHitGoal(newBall) === 'right') {
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsLeft++;
    } else if (ballHitGoal(newBall) === 'left') {
      localGame.gameState.ball = ballSpawn;
      localGame.gameState.pointsRight++;
    } else if (ballhitSide2D(newBall)) {
      bounceOnSide(localGame.gameState.ball);
    } else if (newBall.y > properties.window.height || newBall.y < 0) {
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
    this.runningGames.set(gameId, {
      gameId: gameId,
      spectatorSockets: [],
      gameState: newGame,
      leftPlayer: leftPlayer,
      rightPlayer: rightPlayer,
      gamemode: gamemode,
    });
    if (gamemode === EGamemode.standard) {
      const interval = setInterval(
        this.GameLoop1D.bind(this),
        properties.framerate,
        this.runningGames.get(gameId),
      );
      this.runningGames.get(gameId).interval = interval;
    } else if (gamemode === EGamemode.roomMovement) {
      const interval = setInterval(
        this.GameLoop2D.bind(this),
        properties.framerate,
        this.runningGames.get(gameId),
      );
      this.runningGames.get(gameId).interval = interval;
    }
    return gameId;
  }

  private addClientToQueue(
    user: IUser,
    gamemode: EGamemode,
    client: Socket,
  ): void {
    this.queuedClients.forEach((queue) => {
      queue.delete(user.name);
    });
    this.queuedClients.get(gamemode).set(user.name, {
      user: user,
      socket: client,
    });
  }

  public async queue(
    user: IUser,
    gamemode: EGamemode,
    client: Socket,
  ): Promise<void> {
    this.addClientToQueue(user, gamemode, client);
    if (this.queuedClients.get(gamemode).size >= 2) {
      const [firstClient, firstClientName] = this.queuedClients
        .get(gamemode)
        .entries()
        .next().value;
      this.queuedClients.get(gamemode).delete(firstClient);
      const [secondClient, secondClientName] = this.queuedClients
        .get(gamemode)
        .entries()
        .next().value;
      this.queuedClients.get(gamemode).delete(secondClient);

      const newGameId: string = await this.startGameLoop(
        firstClientName,
        secondClientName,
        gamemode,
      );

      firstClientName.socket.emit('queue found', {
        gameId: newGameId,
        side: 'left',
      });
      secondClientName.socket.emit('queue found', {
        gameId: newGameId,
        side: 'right',
      });
    }
  }

  public getGameData(gameId: string): IGame {
    if (!this.isGameRunning(gameId)) return newGameCopy();
    return this.runningGames.get(gameId).gameState;
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
    this.runningGames.delete(localGame.gameId);
  }

  public getGamemode(gameId: string): EGamemode | undefined | null {
    return this.runningGames.get(gameId)?.gamemode;
  }
}
