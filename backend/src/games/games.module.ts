import { Module } from '@nestjs/common';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';
import { DatabaseGame } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseGame])],
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}
