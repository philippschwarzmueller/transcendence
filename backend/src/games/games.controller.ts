import { Get, Controller, Post } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('ball')
  async ball(): Promise<any> {
    return this.gamesService.ball();
  }

  @Post('start')
  StartGameLoop(): any {
    return this.gamesService.StartGameLoop();
  }

  @Post('stop')
  stop(): void {
    this.gamesService.stop();
  }
}
