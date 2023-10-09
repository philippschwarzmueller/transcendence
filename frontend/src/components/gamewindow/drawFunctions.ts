import properties, { IBall } from "./properties";

export const drawPaddle = (
  context: CanvasRenderingContext2D,
  side: string,
  height: number
): void => {
  const paddleHeight: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100
  );
  const paddleWidth: number = Math.floor(
    (properties.window.width * properties.paddle.width) / 100
  );
  if (side === "left") {
    context.fillStyle = properties.window.color;
    context.clearRect(0, 0, paddleWidth, properties.window.height);
    context.fillStyle = properties.paddle.color;
    context.fillRect(0, height - paddleHeight / 2, paddleWidth, paddleHeight);
  } else if (side === "right") {
    context.fillStyle = properties.window.color;
    context.clearRect(
      properties.window.width - paddleWidth,
      0,
      paddleWidth,
      properties.window.height
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(
      properties.window.width - paddleWidth,
      height - paddleHeight / 2,
      paddleWidth,
      paddleHeight
    );
  }
};

export const drawBothPaddles = (
  context: CanvasRenderingContext2D,
  leftHeight: number,
  rightHeight: number
): void => {
  drawPaddle(context, "left", leftHeight);
  drawPaddle(context, "right", rightHeight);
};

export const drawBall = (
  context: CanvasRenderingContext2D,
  ball: IBall,
  old_ball: IBall
): void => {
  context.clearRect(
    old_ball.x - properties.ballProperties.radius * 2,
    old_ball.y - properties.ballProperties.radius * 2,
    properties.ballProperties.radius * 4,
    properties.ballProperties.radius * 4
  );
  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(ball.x, ball.y, properties.ballProperties.radius, 0, 2 * Math.PI);
  context.fill();
};

export const drawBackground = (context: CanvasRenderingContext2D): void => {
  context.fillStyle = properties.window.color;
  context.fillRect(0, 0, properties.window.width, properties.window.height);
  context.fillStyle = properties.paddle.color;
  const squareSize: number = properties.window.height / 32;
  let currenSquarePos: number = squareSize;
  while (currenSquarePos < properties.window.height) {
    context.fillRect(
      properties.window.width / 2 - squareSize / 2,
      currenSquarePos - squareSize / 2,
      squareSize,
      squareSize
    );
    currenSquarePos += 2 * squareSize;
  }
};

export const drawText = (
  context: CanvasRenderingContext2D,
  pointsLeft: number,
  pointsRight: number
): void => {
  const fontSize: number = properties.window.height / 6;
  context.clearRect(0, 0, properties.window.width, properties.window.height);
  context.font = `${fontSize}px Arial`;
  context.fillStyle = "white";
  context.fillText(
    `${pointsLeft}`,
    properties.window.width / 3,
    properties.window.height / 6
  );
  context.fillText(
    `${pointsRight}`,
    (properties.window.width * 2) / 3,
    properties.window.height / 6
  );
};
