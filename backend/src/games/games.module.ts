import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User])],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
