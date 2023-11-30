import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService, IntraSignInEvent } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { Response, Request } from 'express';
import { TokenResponse } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private hostIP: string;
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.hostIP = this.configService.get<string>('HOST_IP');
  }
  @Post('login')
  @HttpCode(200)
  async login(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.authService.login(createUserDto);
    } catch (error) {
      if (error.message === 'User not found') {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error.message === 'Wrong password') {
        throw new HttpException(error.message, HttpStatus.FORBIDDEN);
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; data: any }> {
    try {
      return await this.authService.signup(createUserDto);
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
    }
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
  ): Promise<void> {
    try {
      const data: TokenResponse =
        await this.authService.exchangeCodeForToken(code);
      if (data === null) {
        res.redirect(`http://${this.hostIP}:3000/login`);
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
        `http://${this.hostIP}:3000/set-user?intraname=${signIn.user.intraname}&firstSignIn=${signIn.firstLogin}`,
      );
    } catch (error) {
      console.error(
        '42 login failed, check your env file or the app config on 42 intra',
      );
    }
  }

  @Post('validate-token')
  async validateToken(@Req() req: Request): Promise<User> | null {
    const token = req.cookies.token;
    if (token == undefined) return null;
    const User: User | null = await this.authService.checkToken(token);
    return User;
  }

  @Post('change-name')
  async changeName(
    @Body() body: { newName: string },
    @Req() req: Request,
  ): Promise<User | null> {
    const token: string = req.cookies.token;
    const user: User | null = await this.authService.checkNameChange(
      token,
      body.newName,
    );
    return user;
  }
}
