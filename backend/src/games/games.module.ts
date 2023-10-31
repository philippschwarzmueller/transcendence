import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WSocketGateway } from '../wsocket/wsocket.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GamesService, WSocketGateway],
})
export class GamesModule {}
