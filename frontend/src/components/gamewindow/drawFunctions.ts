import { EGamemode } from "../queuebutton/Queuebutton";
import { IGameCanvas } from "./Gamewindow";
import properties, {
  IBall,
  IFinishedGame,
  IGame,
  IPaddle,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
  goalSizePercent,
} from "./properties";
import { Gamesocket } from "./socket";

export const drawGame = (
  gamemode: React.MutableRefObject<EGamemode>,
  gameCanvas: IGameCanvas,
  gameStateRef: React.MutableRefObject<IGame>
): void => {
  drawBackground(
    gamemode.current,
    gameCanvas.background.current?.getContext("2d")
  );
  drawBall(
    gameCanvas.ball.current?.getContext("2d"),
    gameStateRef.current.ball
  );
  drawBothPaddles(
    gameCanvas.paddle.current?.getContext("2d"),
    gameStateRef.current
  );
  drawText(
    gameCanvas.score.current?.getContext("2d"),
    gameStateRef.current.pointsLeft,
    gameStateRef.current.pointsRight
  );
};

const getScale = (): number => {
  return Math.min(
    properties.window.width / WINDOW_WIDTH,
    properties.window.height / WINDOW_HEIGHT
  );
};

export const drawPaddle = (
  context: CanvasRenderingContext2D | undefined | null,
  paddle: IPaddle
): void => {
  if (context === undefined || context === null) return;
  const paddleHeight: number = Math.floor(properties.paddle.height);
  const paddleWidth: number = Math.floor(properties.paddle.width);
  const scale: number = getScale();
  if (paddle.side === "left") {
    context.fillStyle = properties.window.color;
    context.clearRect(
      0,
      0,
      properties.window.width / 2,
      properties.window.height
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(
      (paddle.lateral - paddleWidth / 2) * scale,
      (paddle.height - paddleHeight / 2) * scale,
      paddleWidth * scale,
      paddleHeight * scale
    );
  } else if (paddle.side === "right") {
    context.fillStyle = properties.window.color;
    context.clearRect(
      properties.window.width / 2,
      0,
      properties.window.width,
      properties.window.height
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(
      (paddle.lateral - paddleWidth / 2) * scale,
      (paddle.height - paddleHeight / 2) * scale,
      paddleWidth * scale,
      paddleHeight * scale
    );
  }
};

export const drawBothPaddles = (
  context: CanvasRenderingContext2D | undefined | null,
  gameState: IGame
): void => {
  if (context === undefined || context === null) return;
  drawPaddle(context, gameState.leftPaddle);
  drawPaddle(context, gameState.rightPaddle);
};

export const drawBall = (
  context: CanvasRenderingContext2D | undefined | null,
  ball: IBall
): void => {
  if (context === undefined || context === null) return;
  const scale: number = getScale();
  context.clearRect(0, 0, properties.window.width, properties.window.height);
  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(
    ball.x * scale,
    ball.y * scale,
    properties.ballProperties.radius * scale,
    0,
    2 * Math.PI
  );
  context.fill();
};

export const drawBackground = (
  gamemode: EGamemode,
  context: CanvasRenderingContext2D | undefined | null
): void => {
  if (context === undefined || context === null) return;
  const scale: number = getScale();
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
  context.fillRect(
    0,
    0,
    properties.window.width,
    (properties.paddle.width / 2) * scale
  );
  context.fillRect(
    0,
    properties.window.height - (properties.paddle.width / 2) * scale,
    properties.window.width,
    properties.window.height
  );
  if (gamemode === EGamemode.roomMovement) {
    const goalHalf: number =
      (goalSizePercent * properties.window.height) / 2 / 100;
    context.fillRect(
      0,
      0,
      (properties.paddle.width / 2) * scale,
      properties.window.height / 2 - goalHalf
    );
    context.fillRect(
      0,
      properties.window.height / 2 + goalHalf,
      (properties.paddle.width / 2) * scale,
      properties.window.height
    );
    context.fillRect(
      properties.window.width - (properties.paddle.width / 2) * scale,
      0,
      properties.window.width,
      properties.window.height / 2 - goalHalf
    );
    context.fillRect(
      properties.window.width - (properties.paddle.width / 2) * scale,
      properties.window.height / 2 + goalHalf,
      properties.window.width,
      properties.window.height
    );
  }
};

export const drawWinScreen = (
  winner: string | undefined | null,
  winnerPoints: number | undefined,
  looserPoints: number | undefined,
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
    `${winner} won`,
    properties.window.width / 2,
    properties.window.height / 6
  );
  context.fillText(
    `${winnerPoints} - ${looserPoints}`,
    properties.window.width / 2,
    properties.window.height / 3
  );
};

export const drawErrorScreen = (
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
    `Game not found`,
    properties.window.width / 2,
    properties.window.height / 2
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
  context.textAlign = "center";
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

export const fetchAndDrawFinishedGame = (
  socket: Gamesocket,
  gameId: string,
  gameCanvas: React.MutableRefObject<HTMLCanvasElement>
): void => {
  socket.emit(
    "getGameFromDatabase",
    gameId,
    (finishedGameRemote: IFinishedGame) => {
      drawWinScreen(
        finishedGameRemote.winner,
        finishedGameRemote.winnerPoints,
        finishedGameRemote.looserPoints,
        gameCanvas.current?.getContext("2d")
      );
    }
  );
};
