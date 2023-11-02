import properties, { IBall, IKeyState, IPaddle } from './properties';

export const movePaddle1D = (
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

export const movePaddle2D = (
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
  if (
    keyState.left === true &&
    keyState.right === false &&
    ((oldPaddlePos.lateral + step > 0 && oldPaddlePos.side == 'left') ||
      (oldPaddlePos.lateral + step > properties.window.width / 2 &&
        oldPaddlePos.side == 'right'))
  ) {
    oldPaddlePos.lateral -= step;
  } else if (
    keyState.left === false &&
    keyState.right === true &&
    ((oldPaddlePos.lateral + step < properties.window.width / 2 &&
      oldPaddlePos.side == 'left') ||
      (oldPaddlePos.lateral + step < properties.window.width &&
        oldPaddlePos.side == 'right'))
  ) {
    oldPaddlePos.lateral += step;
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
  const deltaPaddle: number = ((paddle.height - ball.y) * 2) / paddleHalf;
  const bounceAngle: number =
    (deltaPaddle / paddleHalf) * properties.ballProperties.maxBounceAngle;
  const incomingSpeed: number = Math.sqrt(
    ball.speed_x * ball.speed_x + ball.speed_y * ball.speed_y,
  );
  ball.speed_x =
    properties.ballProperties.acceleration *
    incomingSpeed *
    Math.cos(bounceAngle) *
    Math.sign(-ball.speed_x);
  ball.speed_y =
    properties.ballProperties.acceleration *
    incomingSpeed *
    Math.sin(bounceAngle) *
    -1;
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
