import { User } from 'src/users/user.entity';
import { EGamemode } from '../properties';

export class CreateGameDto {
  gameId: string;
  leftPlayer?: string;
  rightPlayer?: string;
  winner?: User;
  looser?: string;
  winnerPoints?: number;
  looserPoints?: number;
  isFinished: boolean;
  gamemode?: EGamemode;
}
