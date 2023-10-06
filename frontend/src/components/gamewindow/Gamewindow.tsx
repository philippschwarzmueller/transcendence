import React, { useRef, useEffect, useState } from "react";
import properties, { IBall, IGame, ballSpawn, gameSpawn } from "./properties";
import Button from "../button";
import Centerdiv from "../centerdiv";

interface IGameWindow {}

interface IKeyState {
  up: boolean;
  down: boolean;
}

const fetchGameState = async (
  y: number,
  side: any,
  gameId: number
): Promise<IGame> => {
  const response = await fetch(
    `http://localhost:4000/games/gamestate/${gameId}`,
    {
      method: "POST",
      headers: {
        paddle_pos: `${y}`,
        side: `${side.current}`,
      },
    }
  );
  const ball: IGame = await response.json();
  return ball;
};

const stopAllGames = async (): Promise<void> => {
  await fetch(`http://localhost:4000/games/stopall`, {
    method: "POST",
  });
};

const drawPaddle = (
  context: CanvasRenderingContext2D,
  side: string,
  height: number
): void => {
  const paddle_y: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100
  );
  const paddle_x: number = Math.floor(
    (properties.window.width * properties.paddle.width) / 100
  );
  if (side === "left") {
    context.fillStyle = properties.window.color;
    context.fillRect(
      0,
      height - paddle_y / 2 - properties.paddle.speed,
      paddle_x,
      paddle_y + properties.paddle.speed * 2
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(0, height - paddle_y / 2, paddle_x, paddle_y);
  } else if (side === "right") {
    context.fillStyle = properties.window.color;
    context.fillRect(
      properties.window.width - paddle_x,
      height - paddle_y / 2 - properties.paddle.speed,
      paddle_x,
      paddle_y + properties.paddle.speed * 2
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(
      properties.window.width - paddle_x,
      height - paddle_y / 2,
      paddle_x,
      paddle_y
    );
  }
};

const drawBall = (
  context: CanvasRenderingContext2D,
  ball: IBall,
  old_ball: IBall
): void => {
  context.fillStyle = properties.window.color;
  context.beginPath();
  context.arc(
    old_ball.x,
    old_ball.y,
    properties.ballProperties.radius * 1.1,
    0,
    2 * Math.PI
  );
  context.fill();

  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(ball.x, ball.y, properties.ballProperties.radius, 0, 2 * Math.PI);
  context.fill();
};

const GameWindow: React.FC<IGameWindow> = (props: IGameWindow) => {
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const yRef = useRef(properties.window.height / 2);
  const keyState = useRef<IKeyState>({ down: false, up: false });
  let [ball, setBall] = useState({ x: 200, y: 200, speed_x: 0, speed_y: 0 });
  let [oldBall, setOldBall] = useState(ballSpawn);
  const side = useRef("");
  const game = useRef(gameSpawn);
  const gameId = useRef<number>(0);

  const GameLoop = async (
    keyState: React.MutableRefObject<IKeyState>
  ): Promise<void> => {
    const step: number = Math.floor(
      properties.paddle.speed / properties.framerate
    );
    if (keyState.current.down === true && keyState.current.up === false) {
      yRef.current += step;
    } else if (
      keyState.current.up === true &&
      keyState.current.down === false
    ) {
      yRef.current -= step;
    }
    game.current = await fetchGameState(yRef.current, side, gameId.current);
    setBall(game.current.ball);
  };

  const spawnGame = async (): Promise<void> => {
    const incomingGameId = await fetch(`http://localhost:4000/games/start`, {
      method: "POST",
    });
    gameId.current = await incomingGameId.json();
  };

  const stop = async (): Promise<void> => {
    await fetch(`http://localhost:4000/games/stop/${gameId.current}`, {
      method: "POST",
    });
  };

  const joinLeftPlayer = (): void => {
    side.current = "left";
  };
  const joinRightPlayer = (): void => {
    side.current = "right";
  };

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef.current.getContext("2d");
    context.fillStyle = properties.window.color;
    context.fillRect(0, 0, properties.window.width, properties.window.height);

    window.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "ArrowUp") keyState.current.up = true;
        if (e.key === "ArrowDown") keyState.current.down = true;
      },
      true
    );

    window.addEventListener(
      "keyup",
      function (e) {
        if (e.key === "ArrowUp") keyState.current.up = false;
        if (e.key === "ArrowDown") keyState.current.down = false;
      },
      true
    );

    /*const interval = */ setInterval(
      GameLoop,
      1000 / properties.framerate,
      keyState
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef.current.getContext("2d");

    drawPaddle(context, game.current.left.side, game.current.left.height);
    drawPaddle(context, game.current.right.side, game.current.right.height);
  }, [game.current.left.height, game.current.right.height]);

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef.current.getContext("2d");

    drawBall(context, ball, oldBall);

    setOldBall(ball);
  }, [ball, oldBall]);

  return (
    <>
      <Centerdiv>
        <Button onClick={spawnGame}>Spawn game in backend</Button>
        <br />
      </Centerdiv>

      <Centerdiv>
        <Button onClick={stop}>stopOneGame</Button>
        <br />
      </Centerdiv>

      <Centerdiv>
        <Button onClick={stopAllGames}>stopAllGames</Button>
        <br />
      </Centerdiv>

      <Centerdiv>
        <Button onClick={joinLeftPlayer}>join left player</Button>
        <Button onClick={joinRightPlayer}>join right player</Button>
      </Centerdiv>

      <Centerdiv>
        <canvas
          id="gameCanvas"
          ref={canvasRef}
          width={properties.window.width}
          height={properties.window.height}
          tabIndex={0}
          style={{ border: "3px solid #000000" }}
        ></canvas>
      </Centerdiv>
    </>
  );
};

export default GameWindow;
