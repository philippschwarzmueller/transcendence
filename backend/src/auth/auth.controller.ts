import {
  Body,
  Controller,
  Headers,
  Post,
  Get,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { Response, Request } from 'express';
import { TokenResponse } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
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
    const data: TokenResponse =
      await this.authService.exchangeCodeForToken(code);
    const hashedToken: string = await this.authService.hashToken(
      data.access_token,
    );
    const user: User = await this.authService.createIntraUser(
      data,
      hashedToken,
    );
    res.cookie('token', hashedToken, {
      secure: true,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.redirect(`http://localhost:3000/set-user?user=${user.name}`);
  }

  @Post('validate-token')
  async validateToken(@Req() req: Request): Promise<User> | null {
    const token: string = req.cookies.token;
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
    if (token == undefined) return null;
    const user: User | null = await this.authService.checkToken(token);
		if(user){
			const newUser: User | null = await this.authService.changeName(
				body.newName,
				user,
			);
			return newUser;
		}
    return null;
  }
}
