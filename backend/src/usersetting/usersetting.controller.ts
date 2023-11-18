import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { UsersettingService } from './usersetting.service';
import { User } from '../users/user.entity';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Controller('usersetting')
export class UsersettingController {
  constructor(
    private usersettingService: UsersettingService,
    private authService: AuthService,
  ) {}

  @Post('change-name')
  async changeName(@Req() req: Request, @Body() body): Promise<User | null> {
    const token = req.cookies.token;
    const newName = body.newName;
    if (token == undefined) return null;
    const user: User | null = await this.authService.checkToken(token);
    const updatedUser: User | null = await this.usersettingService.changeName(
      newName,
      user,
    );
    return updatedUser;
  }
}
