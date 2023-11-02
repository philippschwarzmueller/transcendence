import { Module } from '@nestjs/common';
import { WSocketGateway } from '../wsocket/wsocket.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Channels, Messages } from './chat.entity';
import { ChatDAO } from './chat.dao';
import { GamesService } from 'src/games/games.service';
import { Game } from 'src/games/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Messages, Channels])],
  providers: [ChatService, UsersService, ChatDAO, Map, Array],
  controllers: [ChatController],
})
export class ChatModule {}
