import { Controller, Delete, HttpCode, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ITab } from './properties';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  @HttpCode(200)
  async getChats(@Query('userId') userId: string): Promise<ITab[]> {
    return await this.chatService.getChats(userId);
  }

  @Delete('rooms')
  @HttpCode(201)
  async deleteChat(
    @Query('userId') userId: string,
    @Query('chat') chat: number,
  ): Promise<void> {
    await this.chatService.removeChat(userId, chat);
  }
}
