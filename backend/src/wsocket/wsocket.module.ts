import { Module } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { GamesService } from '../games/games.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ChatService, GamesService],
})
export class WSocketModule {}
