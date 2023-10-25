import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from "src/users/users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [ChatGateway, ChatService, UsersService],
  controllers: [ChatController],
})

export class ChatModule {}
