import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';

@Module({
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}
