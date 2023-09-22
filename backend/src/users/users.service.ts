import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(user: CreateUserDto) {
    this.users.push(user);
  }

  findAll(): User[] {
    return this.users;
  }
}
