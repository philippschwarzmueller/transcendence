import { EGamemode } from '../properties';

export class CreateGameDto {
  gameId: string;
  leftPlayer?: string;
  rightPlayer?: string;
  winner?: string;
  looser?: string;
  winnerPoints?: number;
  looserPoints?: number;
  isFinished: boolean;
  gamemode?: EGamemode;
}
