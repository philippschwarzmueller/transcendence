import properties, { IBall, IGame } from "./properties";

export const drawPaddle = (
  context: CanvasRenderingContext2D | undefined | null,
  side: string,
  height: number
): void => {
  if (context === undefined || context === null) return;
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
  context: CanvasRenderingContext2D | undefined | null,
  gameState: IGame
): void => {
  if (context === undefined || context === null) return;
  drawPaddle(context, "left", gameState.leftPaddle.height);
  drawPaddle(context, "right", gameState.rightPaddle.height);
};

export const drawBall = (
  context: CanvasRenderingContext2D | undefined | null,
  ball: IBall
): void => {
  if (context === undefined || context === null) return;
  context.clearRect(0, 0, properties.window.width, properties.window.width);
  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(ball.x, ball.y, properties.ballProperties.radius, 0, 2 * Math.PI);
  context.fill();
};

export const drawBackground = (
  context: CanvasRenderingContext2D | undefined | null
): void => {
  if (context === undefined || context === null) return;
  context.fillStyle = properties.window.color;
  context.fillRect(0, 0, properties.window.width, properties.window.height);
  context.fillStyle = properties.paddle.color;
  const squareSize: number = properties.window.height / 32;
  let currentSquarePos: number = squareSize;
  while (currentSquarePos < properties.window.height) {
    context.fillRect(
      properties.window.width / 2 - squareSize / 2,
      currentSquarePos - squareSize / 2,
      squareSize,
      squareSize
    );
    currentSquarePos += 2 * squareSize;
  }
};

export const drawEndScreen = (
  gameState: IGame,
  context: CanvasRenderingContext2D | undefined | null
): void => {
  if (context === undefined || context === null) return;
  context.textAlign = "center";
  context.fillStyle = "black";
  context.fillRect(0, 0, properties.window.width, properties.window.height);
  const fontSize: number = properties.window.height / 6;
  context.font = `${fontSize}px Arial`;
  context.fillStyle = "white";
  context.fillText(
    `${gameState.winner} won`,
    properties.window.width / 2,
    properties.window.height / 6
  );
  context.fillText(
    `${gameState.pointsLeft} - ${gameState.pointsRight}`,
    properties.window.width / 2,
    properties.window.height / 3
  );
};

export const drawText = (
  context: CanvasRenderingContext2D | undefined | null,
  pointsLeft: number,
  pointsRight: number
): void => {
  if (context === undefined || context === null) return;
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
