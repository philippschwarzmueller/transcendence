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
  ballHitPaddle,
  bounceOnPaddle,
  movePaddle,
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
    this.clients = [];
  }

  public amountOfGammes: number;
  public gameStorage: Map<string, IGameBackend>;
  public clients: IGameUser[];

  private async generateGameId(
    leftPlayerName: string,
    rightPlayerName: string,
  ): Promise<string> {
    const newGame = this.gamesRepository.create({
      isFinished: false,
      leftPlayer: leftPlayerName,
      rightPlayer: rightPlayerName,
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

    // actually moving ball
    localGame.gameState.ball = advanceBall(localGame.gameState.ball);

    // check if game is done, and finish it
    if (isGameFinished(localGame)) await this.cleanUpFinishedGame(localGame);
  }

  public async startGameLoop(
    leftPlayer: IGameUser,
    rightPlayer: IGameUser,
  ): Promise<string> {
    const newGame: IGame = newGameCopy();
    const gameId: string = await this.generateGameId(
      leftPlayer.user.name,
      rightPlayer.user.name,
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
    const interval = setInterval(
      this.GameLoop.bind(this),
      properties.framerate,
      this.gameStorage.get(gameId),
    );
    this.gameStorage.get(gameId).interval = interval;
    return gameId;
  }

  public async queue(
    user: IUser,
    gamemode: EGamemode,
    client: Socket,
  ): Promise<void> {
    this.clients.push({ user: user, socket: client });
    console.log(this.clients);
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
