import {
	Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
	Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
  @Get(':userId')
  async findOne(@Param('userId') name: string): Promise<User> {
    try {
      return await this.usersService.findOneByName(name);
    } catch (e) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND, {
        cause: e,
      });
    }
  }
	@Get('send-friend-request')
	async sendFriendRequest(@Body() body: { requestedFriend: string },
	@Req() req: Request,): Promise<boolean> {
		const token: string = req.cookies.token;
		const user: User | null = await this.usersService.exchangeTokenforUser(token);
		const friend: User | null = await this.usersService.findOneByName(body.requestedFriend);
		return true;
	}
}
