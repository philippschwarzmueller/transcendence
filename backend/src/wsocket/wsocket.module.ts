import { Module } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Channels, Messages } from '../chat/chat.entity';
import { ChatDAO } from '../chat/chat.dao';
import { GamesService } from 'src/games/games.service';
import { Game } from 'src/games/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, Messages, Channels])],
  providers: [GamesService, ChatService, UsersService, ChatDAO, Map, Array],
})
export class WSocketModule {}
