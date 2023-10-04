import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.login(createUserDto);
    if (user) {
      return {
        message: 'User found',
      };
    } else {
      throw new HttpException('No user with such name', HttpStatus.NOT_FOUND);
    }
  }
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<any> {
    await this.authService.signup(createUserDto).catch((error) => {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'User does exist already',
        },
        HttpStatus.CONFLICT,
        { cause: error },
      );
    });
  }
}
