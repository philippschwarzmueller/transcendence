import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async login(user: CreateUserDto) {
    const foundUser = await this.usersRepository.findOne({
      where: { name: user.name, password: user.password },
    });
    if (!foundUser) {
      throw new HttpException(
        'No user with such name or wrong password',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      message: 'User found',
    };
  }

  async signup(user: CreateUserDto): Promise<any> {
    let userExists = await this.usersRepository.exist({
      where: { name: user.name },
    });
    if (!userExists) {
      await this.usersRepository.insert(user);
      return { success: true, message: 'User created successfully' };
    } else {
      throw new HttpException(
        { status: HttpStatus.CONFLICT, error: 'User already exists' },
        HttpStatus.CONFLICT,
      );
    }
  }
}
