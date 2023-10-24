import { Inject, Injectable} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @Inject(UsersService)
    private uS: UsersService,
  ) {}

  async getChats(userId: string): Promise<string[]> {
    const user = await this.uS.findOneByName(userId);
    if(user)
      return user.activeChats;
  }
}
