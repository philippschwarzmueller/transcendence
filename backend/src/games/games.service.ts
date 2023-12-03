import { Injectable } from '@nestjs/common';
import properties, {
  EGamemode,
  gameSpawn,
  IAnonymUser,
  IBall,
  IFinishedGame,
  IGame,
  IGameBackend,
  IGameUser,
  IKeyState,
  IPaddle,
  IUser,
  queueTimeout,
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
import { IChangeSocketPayload } from 'src/wsocket/wsocket.gateway';
import { getWinnerLooserNames, isGameFinished } from './games.utils';
import { User } from 'src/users/user.entity';
import { setInternalBufferSize } from 'typeorm/driver/mongodb/bson.typings';

export const randomBallSpawn = (): IBall => {
  const ballSpeed: number = 8;

  const ySpeed: number =
    ((Math.random() * 10 + 10) / 10) * Math.sign(Math.random() - 0.5);

  const xSpeed: number =
    Math.sqrt(ballSpeed ** 2 - ySpeed ** 2) * Math.sign(Math.random() - 0.5);

  const newBall: IBall = {
    x: properties.window.width / 2,
    y: properties.window.height / 2,
    speed_x: xSpeed,
    speed_y: ySpeed,
  };
  return newBall;
};

const newGameCopy = (): IGame => {
  const newGame: IGame = JSON.parse(JSON.stringify(gameSpawn));
  newGame.ball = randomBallSpawn();
  return newGame;
};

interface IQueuePop {
  firstPlayer: IGameUser;
  secondPlayer: IGameUser;
  firstPlayerAccept: boolean;
  secondPlayerAccept: boolean;
  timestamp: number;
  gamemode: EGamemode;
}

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>, // private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.runningGames = new Map<string, IGameBackend>();
    this.queuedClients = new Map([
      [EGamemode.standard, new Map()],
      [EGamemode.roomMovement, new Map()],
    ]);
    this.queuePop = new Map<number, IQueuePop>();
    this.queueCleanup = setInterval(() => {
      this.queueCleanupLoop();
    }, 1000);
  }

  public runningGames: Map<string, IGameBackend>;
  public queuedClients: Map<EGamemode, Map<string, IGameUser>>;
  public queuePop: Map<number, IQueuePop>;
  public queueCleanup: any;

  private async generateGameId(gamemode: EGamemode): Promise<string> {
    const newGame = this.gamesRepository.create({
      isFinished: false,
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
      relations: ['winner', 'looser'],
    });
    const returnGame: IFinishedGame = { gameExists: true };
    if (!databaseGame || !databaseGame.isFinished) {
      returnGame.gameExists = false;
      return returnGame;
    }
    returnGame.winner = databaseGame.winner.name;
    returnGame.looser = databaseGame.looser.name;
    returnGame.winnerPoints = databaseGame.winnerPoints;
    returnGame.looserPoints = databaseGame.looserPoints;
    return returnGame;
  }

  public alterGameData(
    side: string,
    keystate: IKeyState,
    gameId: string,
    user: IAnonymUser,
  ): IGame {
    if (!this.isGameRunning(gameId)) return newGameCopy();
    if (
      side === 'left' &&
      user.hashedToken === this.runningGames.get(gameId).leftPlayer.user.token
    )
      this.runningGames.get(gameId).gameState.keyStateLeft = keystate;
    else if (
      side === 'right' &&
      user.hashedToken === this.runningGames.get(gameId).rightPlayer.user.token
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
      localGame.gameState.ball = randomBallSpawn();
      localGame.gameState.pointsLeft++;
    } else if (newBall.x < 0) {
      // missed left paddle
      localGame.gameState.ball = randomBallSpawn();
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
      localGame.gameState.ball = randomBallSpawn();
      localGame.gameState.pointsLeft++;
    } else if (ballHitGoal(newBall) === 'left') {
      localGame.gameState.ball = randomBallSpawn();
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
    const gameId: string = await this.generateGameId(gamemode);
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
      queue.delete(user.intraname);
    });
    this.queuedClients.get(gamemode).set(user.intraname, {
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
      const [firstClient, firstClientName]: [string, IGameUser] =
        this.queuedClients.get(gamemode).entries().next().value;
      this.queuedClients.get(gamemode).delete(firstClient);
      const [secondClient, secondClientName]: [string, IGameUser] =
        this.queuedClients.get(gamemode).entries().next().value;
      this.queuedClients.get(gamemode).delete(secondClient);

      const currentSize: number = this.queuePop.size;
      const newQueuePop: IQueuePop = {
        firstPlayer: firstClientName,
        secondPlayer: secondClientName,
        firstPlayerAccept: false,
        secondPlayerAccept: false,
        timestamp: Date.now(),
        gamemode: gamemode,
      };
      this.queuePop.set(currentSize, newQueuePop);
      firstClientName.socket.emit('queue found', currentSize);
      secondClientName.socket.emit('queue found', currentSize);
    }
  }

  public getGameData(gameId: string): IGame {
    if (!this.isGameRunning(gameId)) return newGameCopy();
    return this.runningGames.get(gameId).gameState;
  }

  private calculateNewElo(
    winnerElo: number,
    looserElo: number,
  ): [number, number] {
    const eloFactor: number = 32;
    const winChance: number = 1 / (1 + 10 ** ((looserElo - winnerElo) / 400));
    const lossChance: number = 1 / (1 + 10 ** ((winnerElo - looserElo) / 400));
    const newWinnerElo: number = winnerElo + eloFactor * (1 - winChance);
    const newLooserElo: number = looserElo + eloFactor * (0 - lossChance);
    return [Math.floor(newWinnerElo), Math.floor(newLooserElo)];
  }

  private async handleElo(
    winner: User,
    looser: User,
    gamemode: EGamemode,
  ): Promise<void> {
    if (gamemode != EGamemode.standard) return;
    const [latestWinnerElo, latestLooserElo] = this.calculateNewElo(
      winner.elo[winner.elo.length - 1],
      looser.elo[looser.elo.length - 1],
    );
    winner.elo.push(latestWinnerElo);
    looser.elo.push(latestLooserElo);
    await this.userRepository.save([winner, looser]);
  }

  private async cleanUpFinishedGame(localGame: IGameBackend): Promise<void> {
    this.stop(localGame.gameId);
    localGame.gameState.isFinished = true;

    const [winner, looser]: User[] = await getWinnerLooserNames(
      this.userRepository,
      localGame,
    );

    const winnerPoints = Math.max(
      localGame.gameState.pointsLeft,
      localGame.gameState.pointsRight,
    );
    const looserPoints = Math.min(
      localGame.gameState.pointsLeft,
      localGame.gameState.pointsRight,
    );

    const gameToUpdate = await this.gamesRepository.findOne({
      where: { gameId: localGame.gameId },
    });

    if (!gameToUpdate) {
      console.error(`Game with ID ${localGame.gameId} not found`);
      return;
    }

    gameToUpdate.winner = winner;
    gameToUpdate.looser = looser;
    gameToUpdate.winnerPoints = winnerPoints;
    gameToUpdate.looserPoints = looserPoints;
    gameToUpdate.isFinished = true;

    await this.handleElo(winner, looser, localGame.gamemode);

    this.gamesRepository
      .save(gameToUpdate)
      .then(() => {
        this.runningGames.delete(localGame.gameId);
        localGame.leftPlayer.socket.emit('endgame', localGame.gameId);
        localGame.rightPlayer.socket.emit('endgame', localGame.gameId);
      })
      .catch((error) => {
        console.error('Error updating game:', error.message);
      });
  }

  public getGamemode(gameId: string): EGamemode | undefined | null {
    return this.runningGames.get(gameId)?.gamemode;
  }

  public changeSocket(gameuser: IChangeSocketPayload, socket: Socket): void {
    this.queuedClients.forEach((gamemode) => {
      gamemode.forEach((game) => {
        if (game.user.intraname === gameuser.intraname) game.socket = socket;
      });
    });
    this.runningGames.forEach((game) => {
      if (game.leftPlayer.user.intraname === gameuser.intraname)
        game.leftPlayer.socket = socket;
      if (game.rightPlayer.user.intraname === gameuser.intraname)
        game.rightPlayer.socket = socket;
    });
  }

  public isPlayerInQueue(gameuser: IChangeSocketPayload): boolean {
    let returnValue = false;
    this.queuedClients.forEach((gamemode) => {
      gamemode.forEach((game) => {
        if (game.user.intraname === gameuser.intraname) returnValue = true;
      });
    });
    return returnValue;
  }

  public leaveQueue(gameuser: IChangeSocketPayload): void {
    this.queuedClients.forEach((gamemode) => {
      gamemode.forEach((game) => {
        if (game.user.intraname === gameuser.intraname) {
          gamemode.delete(game.user.intraname);
          return;
        }
      });
    });
  }

  private async emitAndStartGame(
    firstUser: IGameUser,
    secondUser: IGameUser,
    gamemode: EGamemode,
  ): Promise<void> {
    const newGameId: string = await this.startGameLoop(
      firstUser,
      secondUser,
      gamemode,
    );
    firstUser.socket.emit('game found', {
      gameId: newGameId,
      side: 'left',
    });
    secondUser.socket.emit('game found', { gameId: newGameId, side: 'right' });
  }

  public async handleAccept(intraname: string): Promise<void> {
    try {
      this.queuePop.forEach((pop, key) => {
        if (pop.firstPlayer.user.intraname === intraname) {
          pop.firstPlayerAccept = true;
          if (pop.secondPlayerAccept === true) {
            this.emitAndStartGame(
              pop.firstPlayer,
              pop.secondPlayer,
              pop.gamemode,
            );
            throw key;
          }
        } else if (pop.secondPlayer.user.intraname === intraname) {
          pop.secondPlayerAccept = true;
          if (pop.firstPlayerAccept === true) {
            this.emitAndStartGame(
              pop.firstPlayer,
              pop.secondPlayer,
              pop.gamemode,
            );
            throw key;
          }
        }
      });
    } catch (key) {
      this.queuePop.delete(key);
    }
  }

  private queueCleanupLoop(): void {
    let toDelete: number[] = [];
    this.queuePop.forEach((pop, key) => {
      if (pop.timestamp + (queueTimeout + 1) * 1000 < Date.now()) {
        toDelete.push(key);
      }
    });
    toDelete.forEach((key) => {
      this.queuePop.get(key).firstPlayer.socket.emit('game denied');
      this.queuePop.get(key).secondPlayer.socket.emit('game denied');
      this.queuePop.delete(key);
    });
  }

  public handleDecline(intraname: string): void {
    try {
      this.queuePop.forEach((pop, key) => {
        if (pop.firstPlayer.user.intraname === intraname) {
          pop.secondPlayer.socket.emit('game denied');
          throw key;
        } else if (pop.secondPlayer.user.intraname === intraname) {
          pop.firstPlayer.socket.emit('game denied');
          throw key;
        }
      });
    } catch (key) {
      this.queuePop.delete(key);
    }
  }
}
