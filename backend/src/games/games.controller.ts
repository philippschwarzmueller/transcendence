import { Controller, Post, Req, Param, Body } from '@nestjs/common';
import { GamesService } from './games.service';
import { IGame } from './properties';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post('gamestate/:gameId')
  async gamestate(
    @Req() req: Request,
    @Param('gameId') gameId: string,
    @Body() body: Body,
  ): Promise<IGame> {
    return this.gamesService.gamestate(
      await JSON.parse(JSON.stringify(body)),
      parseInt(gameId),
    );
  }

  @Post('start')
  startGameLoop(): number {
    return this.gamesService.startGameLoop();
  }

  @Post('stop/:gameId')
  stop(@Param('gameId') gameId: string): void {
    this.gamesService.stop(parseInt(gameId));
  }

  @Post('stopall')
  stopAll(): void {
    this.gamesService.stopAll();
  }
}
