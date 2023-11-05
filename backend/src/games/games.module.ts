import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GamesService],
})
export class GamesModule {}
