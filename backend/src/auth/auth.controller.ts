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
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { Response } from 'express';

interface ICreateIntraUser {
  token: string;
}

interface IGetUser extends User {
  token: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,

  ) {}
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

  /*   @Get('callback')
  async callback(@Query('code') code: string,@Res() res: Response) : Promise<void> {
    const token : string = await this.authService.exchangeCodeForToken(code);
		const testUser : User = await this.authService.createIntraUser(token);
		
		res.redirect(`http://localhost:3000/set-user?name=${testUser.name}&profilePictureUrl=${testUser.profilePictureUrl}&id=${testUser.id.toString()}`);
		res.
  } */

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const token: string = await this.authService.exchangeCodeForToken(code);
    const user: User = await this.authService.createIntraUser(token);
    res.redirect(`http://localhost:3000/set-user?user=${user.name}`);
  }

  @Get('get-user')
  async getUser(@Res() res: Response) {
    const user = this.UserStorage.getUser();

    if (user) {
      res.set('set-cookie', 'token=TEST; Secure; HttpOnly').json(user);
    } else {
      res.status(404).send('User not found');
    }
  }
}