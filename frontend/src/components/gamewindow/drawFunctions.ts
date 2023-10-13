import properties, { IBall, IGame } from "./properties";

export const drawPaddle = (
  context: CanvasRenderingContext2D,
  side: string,
  height: number
): void => {
  if (context === undefined) return;
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
  gameState: IGame
): void => {
  if (context === undefined) return;
  drawPaddle(context, "left", gameState.left.height);
  drawPaddle(context, "right", gameState.right.height);
};

export const drawBall = (
  context: CanvasRenderingContext2D,
  ball: IBall
): void => {
  if (context === undefined) return;
  context.clearRect(0, 0, properties.window.width, properties.window.width);
  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(ball.x, ball.y, properties.ballProperties.radius, 0, 2 * Math.PI);
  context.fill();
};

export const drawBackground = (context: CanvasRenderingContext2D): void => {
  if (context === undefined) return;
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
  if (context === undefined) return;
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
