import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../user/users.service";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // just returns the user, should akshually return JWT
    return result;
  }
}
