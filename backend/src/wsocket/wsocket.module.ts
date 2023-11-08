import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { GamesModule } from 'src/games/games.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [DatabaseModule, GamesModule, ChatModule],
})
export class WSocketModule {}
