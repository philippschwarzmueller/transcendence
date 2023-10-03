import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  login(user: CreateUserDto) {
    return this.usersRepository.findOne({
      where: { name: user.name, password: user.password },
    });
  }
  async signup(user: CreateUserDto): Promise<any> {
    let userExists = await this.usersRepository.exist({
      where: { name: user.name },
    });
    if (!userExists) {
      await this.usersRepository.insert(user);
    } else {
      throw new Error('User exists');
    }
  }
}
