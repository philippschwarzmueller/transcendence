import { Get, Controller, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { IBall } from './properties';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('ball')
  async ball(): Promise<IBall> {
    return this.gamesService.ball();
  }

  @Post('start')
  startGameLoop(): number {
    return this.gamesService.startGameLoop();
  }

  @Post('stop')
  stop(): void {
    this.gamesService.stop();
  }
}
