import { Get, Controller, Post , Req} from '@nestjs/common';
import { GamesService } from './games.service';
import { IGame } from './properties';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Post('ball')
  async ball(@Req() req: Request): Promise<IGame> {
    const paddlePos = req.headers['paddle_pos']
    // console.log(`Paddle Position: ${paddlePos}`)
    return this.gamesService.ball(req.headers['side'], req.headers['paddle_pos']);
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
