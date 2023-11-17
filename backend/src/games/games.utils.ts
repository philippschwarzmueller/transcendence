import { IGameBackend, IUser, maxScore } from './properties';

export const getWinnerLooserNames = (game: IGameBackend): [IUser, IUser] => {
  const winner: IUser =
    game.gameState.pointsLeft === maxScore
      ? game.leftPlayer.user
      : game.rightPlayer.user;
  const looser: IUser =
    game.gameState.pointsLeft !== maxScore
      ? game.leftPlayer.user
      : game.rightPlayer.user;
  return [winner, looser];
};

export const isGameFinished = (game: IGameBackend): boolean => {
  return (
    game.gameState.pointsLeft >= maxScore ||
    game.gameState.pointsRight >= maxScore
  );
};
