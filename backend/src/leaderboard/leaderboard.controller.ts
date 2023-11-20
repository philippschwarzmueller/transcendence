import { Controller, Get, Inject, Param } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ILeaderboardLine, LeaderboardService } from './leaderboard.service';
import { Game } from 'src/games/game.entity';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
    @Inject(LeaderboardService)
    private leaderboardService: LeaderboardService,
  ) {}

  @Get('data/:gamemode')
  public async getData(
    @Param('gamemode') gamemode: string,
  ): Promise<ILeaderboardLine[]> {
    return this.leaderboardService.getData(gamemode);
  }
}
