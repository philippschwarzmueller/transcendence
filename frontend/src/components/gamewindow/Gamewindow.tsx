import React, { useRef, useEffect, useState } from "react";
import properties from "./properties";

interface IGameWindow {}

interface IKeyState {
  up: boolean;
  down: boolean;
}

const drawPaddle = (
  context: CanvasRenderingContext2D,
  side: string,
  old_height: number,
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
    context.fillRect(0, old_height - paddle_y / 2, paddle_x, paddle_y);
    context.fillStyle = properties.paddle.color;
    context.fillRect(0, height - paddle_y / 2, paddle_x, paddle_y);
  } else if (side === "right") {
    context.fillStyle = properties.window.color;
    context.fillRect(
      properties.window.width - paddle_x,
      old_height - paddle_y / 2,
      paddle_x,
      paddle_y
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

const GameWindow: React.FC<IGameWindow> = (props: IGameWindow) => {
  const containerStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);
  let [y, setY] = useState(properties.window.height / 2);
  let [old_y, setOld_y] = useState(properties.window.height / 2);
  let keyState: IKeyState = { down: false, up: false };

  const GameLoop = (keyState: IKeyState): void => {
    const step: number = Math.floor(
      properties.paddle.speed / properties.framerate
    );
    if (keyState.down === true && keyState.up === false) {
      setY((y) => y + step);
    } else if (keyState.up === true && keyState.down === false) {
      setY((y) => y - step);
    }
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
        if (e.key === "ArrowUp") keyState.up = true;
        if (e.key === "ArrowDown") keyState.down = true;
      },
      true
    );

    window.addEventListener(
      "keyup",
      function (e) {
        if (e.key === "ArrowUp") keyState.up = false;
        if (e.key === "ArrowDown") keyState.down = false;
      },
      true
    );

    /*const interval = */ setInterval(() => {
      GameLoop(keyState);
    }, 1000 / properties.framerate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef.current.getContext("2d");

    drawPaddle(context, "left", old_y, y);

    setOld_y(y);
  }, [y, old_y]);

  return (
    <>
      <div style={containerStyles}>
        <canvas
          id="gameCanvas"
          ref={canvasRef}
          width={properties.window.width}
          height={properties.window.height}
          tabIndex={0}
          style={{ border: "3px solid #000000" }}
        ></canvas>
      </div>
    </>
  );
};

export default GameWindow;
