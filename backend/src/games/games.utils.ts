import { User } from 'src/users/user.entity';
import { IGameBackend, IUser, maxScore } from './properties';
import { Repository } from 'typeorm';

export const getWinnerLooserNames = async (
  userRepository: Repository<User>,
  game: IGameBackend,
): Promise<[User, User]> => {
  const winnerName: string =
    game.gameState.pointsLeft === maxScore
      ? game.leftPlayer.user.intraname
      : game.rightPlayer.user.intraname;
  const looserName: string =
    game.gameState.pointsLeft !== maxScore
      ? game.leftPlayer.user.intraname
      : game.rightPlayer.user.intraname;

  const winner: User = await userRepository.findOne({
    where: { intraname: winnerName },
  });

  const looser: User = await userRepository.findOne({
    where: { intraname: looserName },
  });

  return [winner, looser];
};

export const isGameFinished = (game: IGameBackend): boolean => {
  return (
    game.gameState.pointsLeft >= maxScore ||
    game.gameState.pointsRight >= maxScore
  );
};
