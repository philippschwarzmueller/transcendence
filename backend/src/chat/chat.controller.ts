import { Controller, Delete, HttpCode, Post, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/users/user.entity';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('?')
  @HttpCode(201)
  async updateActiveChatsColumn(
    @Query('userId') userId: string,
    @Query('newChat') newChat: string,
  ): Promise<string[] | undefined> {
    return (await this.chatService.addChat(userId, newChat)).activeChats;
  }

  @Get()
  @HttpCode(200)
  async getAllMessagesFromUse(
    @Query('userId') userId: string,
  ): Promise<string[]> {
    return this.chatService.getMessages(userId);
  }

  @Delete()
  @HttpCode(201)
  async deleteAllChats(
    @Query('userId') userId: string,
  ): Promise<User | undefined> {
    return this.chatService.clearActiveChats(userId);
  }
}
