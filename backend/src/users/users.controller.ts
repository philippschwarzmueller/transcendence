import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

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

  @Put()
  async block(@Query('blocking') blocking: string, @Query('blocked') blocked: string): Promise<void> {
    return this.usersService.addToBlockList(blocking, blocked);
  }
}
