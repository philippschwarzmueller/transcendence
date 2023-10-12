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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';

class CreateIntraUser {
  token: string;
}

class IntraImgRequest {
  token: string;
  size: string;
}

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

  @Post('create-intra-user')
  @HttpCode(201)
  async createIntraUser(
    @Body() IntraUserData: CreateIntraUser,
  ): Promise<{ message: string; data: any }> {
    try {
      return await this.authService.createIntraUser(IntraUserData.token);
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
    }
  }

  @Get('get-intra-profile-img')
  async getIntraImage(@Query('user') user: string): Promise<string> {
    try {
      return await this.authService.getIntraImage(user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  @Get('intra-login')
  async intraLogin(@Res() res: any): Promise<void> {
    return this.authService.intraLogin(res);
  }

  @Get('get-token')
  @HttpCode(200)
  async getToken(@Query('code') code: string): Promise<string> {
    const token: string = await this.authService.exchangeCodeForToken(code);
    return token;
  }
}
