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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @HttpCode(200)
  async login(@Body() createUserDto: CreateUserDto) {
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
  async intraLogin(@Res() res): Promise<void> {
    return this.authService.intraLogin(res);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res) {
    try {
      const token = await this.authService.exchangeCodeForToken(code);
      res.send({ token });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
