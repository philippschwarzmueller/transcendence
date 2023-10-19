export class CreateGameDto {
  gameId: string;
  winner?: string;
  looser?: string;
  winnerPoints?: number;
  looserPoints?: number;
  isFinished: boolean;
}
