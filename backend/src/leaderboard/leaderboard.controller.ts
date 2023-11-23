import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ILeaderboardLine, LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
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
