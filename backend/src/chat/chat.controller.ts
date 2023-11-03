import { Controller, Delete, HttpCode, Post, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { User } from 'src/users/user.entity';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  @HttpCode(200)
  async getChats(@Query('userId') userId: string): Promise<string[]> {
    console.log(await this.chatService.getChats(userId));
    return await this.chatService.getChats(userId);
  }

  @Delete('rooms')
  @HttpCode(201)
  async deleteChat(
    @Query('userId') userId: string,
    @Query('chat') chat: string,
  ): Promise<void> {
    await this.chatService.removeChat(userId, chat);
  }
}
