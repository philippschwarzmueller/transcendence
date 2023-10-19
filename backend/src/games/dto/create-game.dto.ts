export class GameDto {
  gameId: string;
  winner?: string;
  looser?: string;
  winnerPoints?: number;
  looserPoints?: number;
  isFinished: boolean;
}
