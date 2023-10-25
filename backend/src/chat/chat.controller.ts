import { Controller, Delete, HttpCode, Post, Query } from '@nestjs/common';
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
    console.log(userId)
    console.log(newChat)
    return (await (this.chatService.addChat(userId, newChat))).activeChats;
  }
  
  @Delete()
  @HttpCode(201)
  async deleteAllChats(
    @Query('userId') userId: string,
  ): Promise<User | undefined> {
    return this.chatService.clearActiveChats(userId);
  }
}
