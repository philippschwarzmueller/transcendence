import { Module } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { GamesService } from '../games/games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { ChatDAO } from 'src/chat/chat.dao';
import { Game } from 'src/games/game.entity';
import { User } from 'src/users/user.entity';
import { Channels, Messages } from 'src/chat/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, User, Channels, Messages])],
  providers: [ChatService, GamesService, UsersService, ChatDAO],
})
export class WSocketModule {}
