import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Channels, Messages } from './chat.entity';
import { ChatDAO } from './chat.dao';
import { DatabaseModule } from 'src/database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User, Messages, Channels])],
  providers: [ChatService, UsersService, ChatDAO],
  controllers: [ChatController],
})
export class ChatModule {}
