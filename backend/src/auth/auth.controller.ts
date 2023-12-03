import { Body, Controller, Post, Get, Query, Res, Req } from '@nestjs/common';
import { AuthService, IntraSignInEvent } from './auth.service';
import { User } from '../users/user.entity';
import { Response, Request } from 'express';
import { TokenResponse } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { PublicUser } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  private hostIP: string;
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.hostIP = this.configService.get<string>('HOST_IP');
  }

  @Get('intra-login')
  async intraLogin(@Res() res: any): Promise<void> {
    return this.authService.intraLogin(res);
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('token');
    res.send('Logged out');
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void | null> {
    if (!code) {
      res.redirect(`http://${this.hostIP}:3000/login`);
      return null;
    }
    try {
      const data: TokenResponse =
        await this.authService.exchangeCodeForToken(code);
      if (data === null) {
        res.redirect(`http://${this.hostIP}:3000/login`);
        return null;
      }
      const hashedToken: string = await this.authService.hashToken(
        data.access_token,
      );
      const signIn: IntraSignInEvent = await this.authService.IntraSignIn(
        data,
        hashedToken,
      );
      res.cookie('token', hashedToken, {
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.redirect(
        `http://${this.hostIP}:3000/set-user?hashedToken=${hashedToken}&firstSignIn=${signIn.firstLogin}`,
      );
    } catch (error) {
      console.error(
        '42 login failed, check your env file or the app config on 42 intra',
      );
      res.redirect(`http://${this.hostIP}:3000/login`);
      return null;
    }
  }

  @Post('validate-token')
  async validateToken(@Req() req: Request): Promise<PublicUser> {
    let validUser: User;
    let retUser: PublicUser;
    if (!req.cookies.token) {
      validUser = null;
      return validUser;
    }
    try {
      validUser = await this.authService.checkToken(req);
    } catch (error) {
      validUser = null;
      return validUser;
    }
    if (validUser) {
      retUser = await this.authService.createPublicUser(validUser);
      return retUser;
    }
    return validUser;
  }

  @Post('change-name')
  async changeName(
    @Body() body: { newName: string },
    @Req() req: Request,
  ): Promise<PublicUser | null> {
    try {
      const newNameUser: User = await this.authService.checkNameChange(
        req,
        body.newName,
      );
      return await this.authService.createPublicUser(newNameUser);
    } catch (error) {
      return null;
    }
  }
}
