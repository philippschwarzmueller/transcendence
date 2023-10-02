import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(user: CreateUserDto) {
    if (!this.usersRepository.find()) {
      this.usersRepository.save(user);
    } else {
      throw new Error('User exists');
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
