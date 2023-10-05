import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { hash as bcrypt_hash, compare as bcrypt_compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async login(user: CreateUserDto) {
    const foundUser = await this.usersRepository.findOne({
      where: { name: user.name },
    });

    if (!foundUser) {
      throw new Error('User not found');
    }

    const passwordMatch: boolean = await bcrypt_compare(
      user.password,
      foundUser.password,
    );

    if (!passwordMatch) {
      throw new Error('Wrong Password');
    }

    return {
      message: 'Login successful',
    };
  }

  async signup(user: CreateUserDto): Promise<any> {
    let userExists = await this.usersRepository.exist({
      where: { name: user.name },
    });
    if (!userExists) {
      const saltRounds = 10;
      const hash = await bcrypt_hash(user.password, saltRounds);
      await this.usersRepository.insert({ ...user, password: hash });
      return { statusCode: 200, message: 'User created successfully' };
    } else {
      throw new Error('User already exists');
    }
  }
}
