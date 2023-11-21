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
import { FriendState } from './users.service';

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
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const friend: User | null = await this.usersService.findOneByName(
      body.requestedFriend,
    );
    if (user === null || friend === null) {
      return false;
    }
    await this.usersService.addFriend(user, friend);
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
    await this.usersService.acceptFriendRequest(user, friend);
    return true;
  }

  @Post('get-friends')
  async getFriends(@Req() req: Request): Promise<User[]> {
    const token: string = req.cookies.token;
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const friendList: User[] = await this.usersService.getFriendList(user.name);
    return friendList;
  }

  @Post('remove-friend')
  async removeFriend(
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
    await this.usersService.removeFriend(user, friend);
    return true;
  }

  @Post('get-friend-state')
  async getFriendState(
    @Body() body: { name: string },
    @Req() req: Request,
  ): Promise<FriendState> {
    const token: string = req.cookies.token;
    const user: User | null =
      await this.usersService.exchangeTokenforUser(token);
    const friend: User | null = await this.usersService.findOneByName(
      body.name,
    );
    return(await this.usersService.getFriendState(user.name, friend.name));
  }
}
