import properties, {
  IBall,
  IKeyState,
  IPaddle,
  gameSpawn,
  goalSizePercent,
} from './properties';

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

export const accelerateBall = (ball: IBall): IBall => {
  const ballSpeed = Math.sqrt(ball.speed_x ** 2 + ball.speed_y ** 2);
  if (ballSpeed <= properties.ballProperties.maxSpeed) {
    ball.speed_x *= properties.ballProperties.acceleration;
    ball.speed_y *= properties.ballProperties.acceleration;
  }
  return ball;
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
    incomingSpeed * Math.cos(bounceAngle) * Math.sign(-ball.speed_x);
  ball.speed_y = incomingSpeed * Math.sin(bounceAngle) * -1;
  ball.x =
    paddle.lateral +
    (properties.paddle.width / 2 + properties.ballProperties.radius) *
      Math.sign(ball.speed_x);
  ball = accelerateBall(ball);
  return ball;
};

export const movingPaddleHitsBall = (
  ball: IBall,
  newPaddle: IPaddle,
  oldPaddle: IPaddle,
): boolean => {
  const paddleHalf: number = Math.floor(properties.paddle.height / 2);

  if (
    ball.y > newPaddle.height + paddleHalf ||
    ball.y < newPaddle.height - paddleHalf
  )
    return false;

  if (
    (oldPaddle.lateral <= ball.x && newPaddle.lateral >= ball.x) ||
    (oldPaddle.lateral >= ball.x && newPaddle.lateral <= ball.x)
  )
    return true;
  else return false;
};

export const ballHitPaddle = (ball: IBall, paddle: IPaddle): boolean => {
  const paddleHalf: number = Math.floor(properties.paddle.height / 2);
  if (
    (ball.x <= paddle.lateral && ball.x + ball.speed_x >= paddle.lateral) ||
    (ball.x >= paddle.lateral && ball.x + ball.speed_x <= paddle.lateral)
  ) {
    const ballLateral: number =
      ((ball.x - paddle.lateral) / ball.speed_x) * ball.speed_y + ball.y;
    if (
      ballLateral < paddle.height + paddleHalf &&
      ballLateral > paddle.height - paddleHalf
    )
      return true;
  } else return false;
};

export const ballhitSide1D = (ball: IBall): boolean => {
  return ball.x > properties.window.width || ball.x < 0;
};

export const ballhitSide2D = (ball: IBall): boolean => {
  const goalHalf: number =
    (goalSizePercent * properties.window.height) / 100 / 2;

  return (
    ballhitSide1D(ball) &&
    (ball.y < properties.window.height / 2 - goalHalf ||
      ball.y > properties.window.height / 2 + goalHalf)
  );
};

export const ballHitGoal = (ball: IBall): string | null => {
  const goalHalf: number =
    (goalSizePercent * properties.window.height) / 100 / 2;
  if (
    ball.x < 0 &&
    ball.y > properties.window.height / 2 - goalHalf &&
    ball.y < properties.window.height / 2 + goalHalf
  ) {
    return 'left';
  } else if (
    ball.x > properties.window.width &&
    ball.y > properties.window.height / 2 - goalHalf &&
    ball.y < properties.window.height / 2 + goalHalf
  ) {
    return 'right';
  }
};

export const bounceOnSide = (ball: IBall): void => {
  ball.speed_x *= -1;
  ball = accelerateBall(ball);
};

export const bounceOnTop = (ball: IBall): void => {
  ball.speed_y *= -1;
  ball = accelerateBall(ball);
};
