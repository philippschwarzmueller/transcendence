import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Put,
  Post,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { PublicUser } from './users.service';
import { Request } from 'express';
import { FriendState } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get()
  async findAll(): Promise<PublicUser[]> {
    const users: User[] = await this.usersService.findAll();
    return await this.usersService.createPublicUserArray(users);
  }

  @Get('names')
  findAllNames(): Promise<string[]> {
    return this.usersService.findAllNames();
  }

  @Get(':userId')
  async findOne(@Param('userId') name: string): Promise<PublicUser> {
    try {
      const user: User = await this.usersService.findOneByName(name);
      return this.usersService.createPublicUser(user);
    } catch (e) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND, {
        cause: e,
      });
    }
  }

  @Get('intraname/:userId')
  async findOneIntra(@Param('userId') intraname: string): Promise<PublicUser> {
    try {
      const user: User = await this.usersService.findOneByIntraName(intraname);
      return this.usersService.createPublicUser(user);
    } catch (e) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND, {
        cause: e,
      });
    }
  }

  @Get('get-user-with-token')
  async getUserWithToken(
    @Body() body: { hashedToken: string },
    @Req() req: Request,
  ): Promise<User | null> {
    const cookie_token: string = req.cookies.token;
    const hashedToken = body.hashedToken;
    if (cookie_token !== hashedToken)
      return null;
    return(await this.usersService.findOneByHashedToken(hashedToken));
  }

  @Put('block')
  async block(
    @Query('blocking') blocking: string,
    @Query('blocked') blocked: string,
  ): Promise<boolean> {
    return this.usersService.addToBlockList(blocking, blocked);
  }

  @Post('block')
  async getIsBlocked(
    @Query('blocking') user: string,
    @Query('blocked') blocked: string,
  ): Promise<boolean> {
    return this.usersService.isBlocked(user, blocked);
  }

  @Delete('block')
  async unblock(
    @Query('blocking') user: string,
    @Query('blocked') blocked: string,
  ): Promise<boolean> {
    return this.usersService.removeFromBlockList(user, blocked);
  }

  @Get('/intra/:userId')
  async findIntra(@Param('userId') name: string): Promise<PublicUser> {
    try {
      const user: User = await this.usersService.findOneByIntraName(name);
      return this.usersService.createPublicUser(user);
    } catch (e) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND, {
        cause: e,
      });
    }
  }

  @Post('send-friend-request')
  async sendFriendRequest(
    @Body() body: { friend: string },
    @Req() req: Request,
  ): Promise<boolean> {
    return await this.usersService.addFriend(req, body.friend);
  }

  @Post('get-pending-friend-requests')
  async getPendingFriendRequests(@Req() req: Request): Promise<PublicUser[]> {
    const pendingUsers: User[] =
      await this.usersService.getFriendRequestList(req);
    if (pendingUsers) {
      return this.usersService.createPublicUserArray(pendingUsers);
    }
    return [];
  }

  @Post('get-received-friend-requests')
  async getReceivedFriendRequests(@Req() req: Request): Promise<PublicUser[]> {
    const ReceivedFriendRequestsFromUsers: User[] =
      await this.usersService.getReceivedFriendRequestList(req);
    if (ReceivedFriendRequestsFromUsers) {
      return this.usersService.createPublicUserArray(
        ReceivedFriendRequestsFromUsers,
      );
    }
    return [];
  }

  @Post('accept-friend-request')
  async acceptFriendRequest(
    @Body() body: { friend: string },
    @Req() req: Request,
  ): Promise<boolean> {
    return await this.usersService.acceptFriendRequest(req, body.friend);
  }

  @Post('deny-friend-request')
  async denyFriendRequest(
    @Body() body: { friend: string },
    @Req() req: Request,
  ): Promise<boolean> {
    return await this.usersService.denyFriendRequest(req, body.friend);
  }

  @Post('get-friends')
  async getFriends(@Req() req: Request): Promise<PublicUser[] | null> {
    const friendList: User[] = await this.usersService.getFriendList(req);
    if (friendList) {
      return this.usersService.createPublicUserArray(friendList);
    }
    return [];
  }

  @Post('remove-friend')
  async removeFriend(
    @Body() body: { friend: string },
    @Req() req: Request,
  ): Promise<boolean> {
    return await this.usersService.removeFriend(req, body.friend);
  }

  @Post('get-friend-state')
  async getFriendState(
    @Body() body: { name: string },
    @Req() req: Request,
  ): Promise<FriendState> {
    return await this.usersService.getFriendState(req, body.name);
  }

  @Post('change-avatar')
  async changeAvatar(
    @Body() body: { avatar: string },
    @Req() req: Request,
  ): Promise<boolean> {
    return await this.usersService.changeAvatar(req, body.avatar);
  }

  @Post('back-to-fallback-profilepicture')
  async backToFallbackProfilePicture(@Req() req: Request): Promise<boolean> {
    return await this.usersService.backToFallbackProfilePicture(req);
  }
}
