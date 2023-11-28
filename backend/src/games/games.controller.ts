import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Injectable,
  Param,
} from '@nestjs/common';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EGamemode } from './properties';
import { GamesService } from './games.service';
import { Game } from './game.entity';

interface IMatch {
  winnerNickname: string;
  looserNickname: string;
  winnerPoints: number;
  looserPoints: number;
  wonGame: boolean;
  timestamp: Date;
  enemyIntra: string;
  gamemode: EGamemode;
}

interface ISpectateGame {
  gameId: string;
  leftPlayerNickname: string;
  leftPlayerIntraname: string;
  leftPlayerPoints: number;
  rightPlayerNickname: string;
  rightPlayerIntraname: string;
  rightPlayerPoints: number;
}

@Injectable()
@Controller('games')
export class GamesController {
  constructor(
    @Inject(GamesService)
    private gamesService: GamesService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(GamesService)
    private gammesService: GamesService,
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  @Get('runninggames')
  public getRunningGames(): ISpectateGame[] {
    const spectateGames: ISpectateGame[] = [];
    this.gammesService.runningGames.forEach((game) => {
      const newSpectateGame: ISpectateGame = {
        gameId: game.gameId,
        leftPlayerNickname: game.leftPlayer.user.name,
        leftPlayerIntraname: game.leftPlayer.user.intraname,
        leftPlayerPoints: game.gameState.pointsLeft,
        rightPlayerNickname: game.rightPlayer.user.name,
        rightPlayerIntraname: game.rightPlayer.user.intraname,
        rightPlayerPoints: game.gameState.pointsRight,
      };
      spectateGames.push(newSpectateGame);
    });
    return spectateGames;
  }

  @Get('runninggames/:intraname')
  public getRunningGamesPlayer(
    @Param('intraname') intraname: string,
  ): ISpectateGame[] {
    const spectateGames: ISpectateGame[] = [];
    this.gammesService.runningGames.forEach((game) => {
      if (
        game.leftPlayer.user.name === intraname ||
        game.rightPlayer.user.name === intraname
      ) {
        const newSpectateGame: ISpectateGame = {
          gameId: game.gameId,
          leftPlayerNickname: game.leftPlayer.user.name,
          leftPlayerIntraname: game.leftPlayer.user.intraname,
          leftPlayerPoints: game.gameState.pointsLeft,
          rightPlayerNickname: game.rightPlayer.user.name,
          rightPlayerIntraname: game.rightPlayer.user.intraname,
          rightPlayerPoints: game.gameState.pointsRight,
        };
        spectateGames.push(newSpectateGame);
      }
    });
    return spectateGames;
  }

  @Get('getwongamesamount/:intraname')
  public async getWonGamesAmount(
    @Param('intraname') intraname: string,
  ): Promise<number> {
    const user: User = await this.userRepository.findOne({
      where: { intraname: intraname },
      relations: ['wonGames'],
    });
    if (!user) return 0;
    return user.wonGames.length;
  }

  @Get('getlostgamesamount/:intraname')
  public async getLostGamesAmount(
    @Param('intraname') intraname: string,
  ): Promise<number> {
    const user: User = await this.userRepository.findOne({
      where: { intraname: intraname },
      relations: ['lostGames'],
    });
    if (!user) return 0;
    return user.lostGames.length;
  }

  @Get('gettotalgamesamount/:intraname')
  public async getTotalGamesAmount(
    @Param('intraname') intraname: string,
  ): Promise<number> {
    return (
      (await this.getWonGamesAmount(intraname)) +
      (await this.getLostGamesAmount(intraname))
    );
  }

  @Get('getwinrate/:intraname')
  public async getWinrate(
    @Param('intraname') intraname: string,
  ): Promise<number> {
    const totalGames: number = await this.getTotalGamesAmount(intraname);
    return totalGames > 0
      ? ((await this.getWonGamesAmount(intraname)) / totalGames) * 100
      : 0;
  }

  @Get('getelo/:intraname')
  public async getElo(@Param('intraname') intraname: string): Promise<number> {
    const user: User = await this.userRepository.findOne({
      where: { intraname: intraname },
    });
    if (!user) return 1000;
    return user.elo[user.elo.length - 1];
  }

  @Get('getallelo/:intraname')
  public async getAllElo(
    @Param('intraname') intraname: string,
  ): Promise<number[]> {
    const user: User = await this.userRepository.findOne({
      where: { intraname: intraname },
    });
    if (!user) return [];
    return user.elo;
  }

  @Get('getallgames/:intraname')
  public async getallgames(
    @Param('intraname') intraname: string,
  ): Promise<IMatch[]> {
    const user: User = await this.userRepository.findOne({
      where: { intraname: intraname },
      relations: [
        'wonGames',
        'wonGames.winner',
        'wonGames.looser',
        'lostGames',
        'lostGames.winner',
        'lostGames.looser',
      ],
    });
    if (!user) return [];
    const Matches: IMatch[] = [];

    user.wonGames.forEach((game) => {
      if (!game.isFinished) return;
      Matches.push({
        winnerNickname: game.winner.intraname,
        looserNickname: game.looser.intraname,
        winnerPoints: game.winnerPoints,
        looserPoints: game.looserPoints,
        wonGame: game.winner.name === intraname,
        timestamp: game.createdAt,
        enemyIntra:
          game.winner.name === intraname
            ? game.looser.intraname
            : game.winner.intraname,
        gamemode: game.gamemode,
      });
    });
    user.lostGames.forEach((game) => {
      if (!game.isFinished) return;
      Matches.push({
        winnerNickname: game.winner.intraname,
        looserNickname: game.looser.intraname,
        winnerPoints: game.winnerPoints,
        looserPoints: game.looserPoints,
        wonGame: game.winner.name === intraname,
        timestamp: game.createdAt,
        enemyIntra:
          game.winner.name === intraname
            ? game.looser.intraname
            : game.winner.intraname,
        gamemode: game.gamemode,
      });
    });

    return Matches.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  @Get('players/:gameId')
  public async getPlayers(@Param('gameId') gameId: string): Promise<string[]> {
    if (this.gamesService.isGameRunning(gameId))
      return [
        this.gamesService.runningGames.get(gameId).leftPlayer.user.name,
        this.gamesService.runningGames.get(gameId).rightPlayer.user.name,
      ];
    else {
      const game: Game = await this.gamesRepository.findOne({
        where: { gameId: gameId },
        relations: ['winner', 'looser'],
      });
      if (game) return [game.winner.name, game.looser.name];
    }
    return ['', ''];
  }
}
