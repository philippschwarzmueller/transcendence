import React, { useRef, useEffect, useState } from "react";
import properties, { IBall, ballSpawn } from "./properties";
import Button from "../button";
import Centerdiv from "../centerdiv";

interface IGameWindow {}

interface IKeyState {
  up: boolean;
  down: boolean;
}

const spawnGame = async (): Promise<void> => {
  await fetch(`http://localhost:4000/games/start`, { method: "POST" });
};

const fetchBall = async (y: number): Promise<IBall> => {
  const response = await fetch(`http://localhost:4000/games/ball`, {
    method: "POST",
    headers: {
      paddle_pos: `${y}`
    }

  ,
  });
  const ball: IBall = await response.json();
  return ball;
};

const stopGames = async (): Promise<void> => {
  await fetch(`http://localhost:4000/games/stop`, {
    method: "POST",
  });
};

const joinLeftPlayer = (): void => {}
const joinRightPlayer = (): void => {}

const drawPaddle = (
  context: CanvasRenderingContext2D,
  side: string,
  old_height: number,
  height: number,
): void => {
  const paddle_y: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100,
  );
  const paddle_x: number = Math.floor(
    (properties.window.width * properties.paddle.width) / 100,
  );
  if (side === "left") {
    context.fillStyle = properties.window.color;
    context.fillRect(0, old_height - paddle_y / 2, paddle_x, paddle_y);
    context.fillStyle = properties.paddle.color;
    context.fillRect(0, height - paddle_y / 2, paddle_x, paddle_y);
  } else if (side === "right") {
    context.fillStyle = properties.window.color;
    context.fillRect(
      properties.window.width - paddle_x,
      old_height - paddle_y / 2,
      paddle_x,
      paddle_y,
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(
      properties.window.width - paddle_x,
      height - paddle_y / 2,
      paddle_x,
      paddle_y,
    );
  }
  // console.log(height)
};

const drawBall = (
  context: CanvasRenderingContext2D,
  ball: IBall,
  old_ball: IBall,
): void => {
  context.fillStyle = properties.window.color;
  context.beginPath();
  context.arc(
    old_ball.x,
    old_ball.y,
    properties.ballProperties.radius * 1.1,
    0,
    2 * Math.PI,
  );
  context.fill();

  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(ball.x, ball.y, properties.ballProperties.radius, 0, 2 * Math.PI);
  context.fill();
};

const GameWindow: React.FC<IGameWindow> = (props: IGameWindow) => {
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const yRef = useRef(properties.window.height / 2)
  let [old_y, setOld_y] = useState(properties.window.height / 2);
  const keyState = useRef<IKeyState>({ down: false, up: false })
  let [ball, setBall] = useState({ x: 200, y: 200, speed_x: 0, speed_y: 0 });
  let [oldBall, setOldBall] = useState(ballSpawn);

  const GameLoop = async (keyState: React.MutableRefObject<IKeyState>): Promise<void> => {
    const step: number = Math.floor(
      properties.paddle.speed / properties.framerate,
    );
    if (keyState.current.down === true && keyState.current.up === false) {
      yRef.current += step
    } else if (keyState.current.up === true && keyState.current.down === false) {
      yRef.current -= step
    }
    setBall(await fetchBall(yRef.current));
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
      true,
    );

    window.addEventListener(
      "keyup",
      function (e) {
        if (e.key === "ArrowUp") keyState.current.up = false;
        if (e.key === "ArrowDown") keyState.current.down = false;
      },
      true,
    );

    /*const interval = */ setInterval(
      GameLoop, 1000 / properties.framerate, keyState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef.current.getContext("2d");

    drawPaddle(context, "left", old_y, yRef.current);
    setOld_y(yRef.current);
  }, [yRef.current, old_y]);

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
        <Button onClick={stopGames}>stopGames</Button>
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
