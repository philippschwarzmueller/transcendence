import { Controller, Get, Inject } from '@nestjs/common';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
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

  @Get('test')
  public test(): string {
    return this.leaderboardService.test();
  }

  // @Get('getwongamesamount/:intraname')
  // public async getWonGamesAmount(
  //   @Param('intraname') intraname: string,
  // ): Promise<number> {
  //   const user: User = await this.userRepository.findOne({
  //     where: { intraname: intraname },
  //     relations: ['wonGames'],
  //   });
  //   if (!user) throw new BadRequestException('user not found');
  //   return user.wonGames.length;
  // }
}
