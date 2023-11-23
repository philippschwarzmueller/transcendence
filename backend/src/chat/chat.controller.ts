import { Controller, Delete, HttpCode, Get, Query, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { IChannel, ITab } from './properties';

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

  @Post()
  @HttpCode(201)
  async createChat(
    @Body() data: IChannel
  ): Promise<void> {
    console.log(data);
    this.chatService.addU2UChat(data);
  }
}
