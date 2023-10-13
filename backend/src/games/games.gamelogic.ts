import properties, { IBall, IKeyState, IPaddle } from './properties';

export const movePaddle = (
  keyState: IKeyState,
  oldPaddlePos: IPaddle,
): IPaddle => {
  const step: number = Math.floor(
    properties.paddle.speed / properties.framerate,
  );
  if (
    keyState.down === true &&
    keyState.up === false &&
    oldPaddlePos.height + step < properties.window.height
  ) {
    oldPaddlePos.height += step;
  } else if (
    keyState.up === true &&
    keyState.down === false &&
    oldPaddlePos.height - step > 0
  ) {
    oldPaddlePos.height -= step;
  }
  return oldPaddlePos;
};

export const advanceBall = (oldBall: IBall): IBall => {
  const newBall: IBall = {
    x: oldBall.x + oldBall.speed_x,
    y: oldBall.y + oldBall.speed_y,
    speed_x: oldBall.speed_x,
    speed_y: oldBall.speed_y,
  };
  return newBall;
};

export const bounceOnPaddle = (ball: IBall, paddle: IPaddle): IBall => {
  const paddleHalf: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100 / 2,
  );
  ball.speed_x *= -1; // turn around
  const deltaPaddle: number = ((paddle.height - ball.y) * 2) / paddleHalf;
  ball.speed_y = -Math.abs(ball.speed_x) * deltaPaddle; // y-direction change
  ball.speed_x *= properties.ballProperties.acceleration; // acceleration
  return ball;
};

export const ballHitPaddle = (ball: IBall, paddle: IPaddle): boolean => {
  const paddleHalf: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100 / 2,
  );
  if (paddle.side === 'right')
    return (
      ball.x >
        properties.window.width -
          properties.paddle.width -
          properties.ballProperties.radius &&
      ball.y < paddle.height + paddleHalf &&
      ball.y > paddle.height - paddleHalf
    );
  else
    return (
      ball.x < properties.paddle.width + properties.ballProperties.radius &&
      ball.y < paddle.height + paddleHalf &&
      ball.y > paddle.height - paddleHalf
    );
};
