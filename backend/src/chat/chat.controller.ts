import { Controller, Delete, HttpCode, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/users/user.entity';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  @HttpCode(201)
  async updateActiveChatsColumn(
    @Query('userId') userId: string,
    @Query('newChat') newChat: string,
  ): Promise<string[] | undefined> {
    return (await (this.chatService.addChat(userId, newChat))).activeChats;
  }
  
  @Delete('all')
  @HttpCode(201)
  async deleteAllChats(
    @Query('userId') userId: string,
  ): Promise<User | undefined> {
    return this.chatService.clearActiveChats(userId);
  }

  @Delete('rooms')
  @HttpCode(201)
  async deleteChat(
    @Query('userId') userId: string,
    @Query('chat') chat: string,
  ): Promise<string[] | undefined> {
    return (await (this.chatService.removeChat(userId, chat))).activeChats;
  }
}
