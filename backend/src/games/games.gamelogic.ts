import properties, { IBall, IKeyState, IPaddle, gameSpawn } from './properties';

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
  paddlePos: IPaddle,
): IPaddle => {
  paddlePos = movePaddle1D(keyState, paddlePos);
  const safeSpace: number = properties.window.width / 10;
  const step: number = Math.floor(
    properties.paddle.speed / properties.framerate,
  );
  if (keyState.left === true && keyState.right === false) {
    if (paddlePos.side == 'left') {
      if (paddlePos.lateral + step > properties.paddle.width)
        paddlePos.lateral -= step;
      else paddlePos.lateral = gameSpawn.leftPaddle.lateral;
    }
    if (paddlePos.side == 'right') {
      if (
        paddlePos.lateral + step >
        properties.window.width / 2 + properties.paddle.width + safeSpace
      )
        paddlePos.lateral -= step;
      else
        paddlePos.lateral =
          properties.window.width / 2 + properties.paddle.width / 2 + safeSpace;
    }
  } else if (keyState.left === false && keyState.right === true) {
    if (paddlePos.side == 'left') {
      if (paddlePos.lateral + step < properties.window.width / 2 - safeSpace)
        paddlePos.lateral += step;
      else paddlePos.lateral = properties.window.width / 2 - safeSpace;
    }
    if (paddlePos.side == 'right') {
      if (
        paddlePos.lateral + step <
        properties.window.width - properties.paddle.width
      )
        paddlePos.lateral += step;
      else paddlePos.lateral = gameSpawn.rightPaddle.lateral;
    }
  }
  return paddlePos;
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
  const paddleHalf: number = Math.floor(properties.paddle.height / 2);
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
  const paddleHalf: number = Math.floor(properties.paddle.height / 2);
  return (
    ball.y < paddle.height + paddleHalf &&
    ball.y > paddle.height - paddleHalf &&
    ((ball.x < paddle.lateral && ball.x + ball.speed_x > paddle.lateral) ||
      (ball.x > paddle.lateral && ball.x + ball.speed_x < paddle.lateral))
  );
};
