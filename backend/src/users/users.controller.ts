import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
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
  @Post('send-friend-request')
  async sendFriendRequest(
    @Body() body: { requestedFriend: string },
    @Req() req: Request,
  ): Promise<boolean> {
    const token: string = req.cookies.token;
    console.log(token);
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const friend: User | null = await this.usersService.findOneByName(
      body.requestedFriend,
    );
    console.log(friend);
    if (user === null || friend === null) {
      return false;
    }
    console.log(`in controler ${user.name}`);
    console.log(`in controler ${friend.name}`);
    await this.usersService.addFriend(user.name, friend.name);
    return true;
  }

  @Post('get-pending-friend-requests')
  async getPendingFriendRequests(@Req() req: Request): Promise<User[]> {
    const token: string = req.cookies.token;
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const pendingUsers: User[] = await this.usersService.getFriendRequestList(
      user.name,
    );
    return pendingUsers;
  }

  @Post('get-received-friend-requests')
  async getReceivedFriendRequests(@Req() req: Request): Promise<User[]> {
    const token: string = req.cookies.token;
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const ReceivedFriendRequestsFromUsers: User[] =
      await this.usersService.getReceivedFriendRequestList(user.name);
    return ReceivedFriendRequestsFromUsers;
  }

  @Post('accept-friend-request')
  async acceptFriendRequest(
    @Body() body: { friend: string },
    @Req() req: Request,
  ): Promise<boolean> {
    const token: string = req.cookies.token;
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const friend: User | null = await this.usersService.findOneByName(
      body.friend,
    );
    if (user === null || friend === null) {
      return false;
    }
    console.log(`in controler ${user.name}`);
    console.log(`in controler ${friend.name}`);
    await this.usersService.acceptFriendRequest(user.name, friend.name);
    return true;
  }
}
