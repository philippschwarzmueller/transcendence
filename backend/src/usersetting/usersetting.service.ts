import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersettingService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async changeName(newName: string, user: User): Promise<User | null> {
    await this.usersRepository.update(
      {
        name: user.name,
      },
      {
        name: newName,
      },
    );
    const newUser: User = await this.usersRepository.findOne({
      where: { name: newName },
    });
    return newUser;
  }
}
