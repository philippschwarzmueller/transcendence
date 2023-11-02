import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WSocketGateway } from '../wsocket/wsocket.gateway';
import { ChatService } from 'src/chat/chat.service';
import { ChatDAO } from 'src/chat/chat.dao';
import { UsersService } from 'src/users/users.service';
import { Channels, Messages } from 'src/chat/chat.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GamesService],
})
export class GamesModule {}
