import React, { useRef, useEffect, useState } from "react";
import * as properties from "./properties";

interface IGameWindow {
  width: number;
  height: number;
}

interface IKeyState {
  up: boolean;
  down: boolean;
}

const GameWindow: React.FC<IGameWindow> = (props: IGameWindow) => {
  const containerStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);
  let [y, setY] = useState(320);
  let [old_y, setOld_y] = useState(320);
  let keyState: IKeyState = { down: false, up: false };

  const GameLoop: any = (keyState: IKeyState) => {
    if (keyState?.down === true) setY((y) => y + 5);
    else if (keyState?.up === true) setY((y) => y - 5);
  };

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef?.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef?.current?.getContext("2d");
    const framerate: number = 1000 / 30;
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
    const interval = setInterval(() => {
      GameLoop(keyState);
    }, framerate);
    console.log(properties.variable);
  }, []);

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef?.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef?.current?.getContext("2d");

    context.clearRect(0, old_y - props.height / 2, props.width, props.height);
    context.fillRect(0, y - props.height / 2, props.width, props.height);
    setOld_y(y);
  }, [y]);

  return (
    <>
      <div style={containerStyles}>
        <canvas
          id="gameCanvas"
          ref={canvasRef}
          width="960"
          height="640"
          color="red"
          tabIndex={0}
          style={{ border: "3px solid #000000" }}
        ></canvas>
      </div>
    </>
  );
};

const Game: React.FC = () => {
  return (
    <>
      <h1>This is the title</h1>
      <div>
        <GameWindow width={20} height={100}></GameWindow>
      </div>
    </>
  );
};

export default Game;
