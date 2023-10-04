import {
  Body,
  Get,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('ball')
  async ball(): Promise<any> {
    return this.gamesService.ball();
  }

  @Get('start')
  StartGameLoop(): any {
    return this.gamesService.StartGameLoop();
  }
}
