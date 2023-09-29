import React from "react";

import { useRef, useEffect } from "react";

interface IGameWindow {
  width: number;
  height: number;
}

function check(e: any) {
  var code = e.keyCode;
  switch (code) {
    case 37:
      alert("Left");
      break; //Left key
    case 38:
      alert("Up");
      break; //Up key
    case 39:
      alert("Right");
      break; //Right key
    case 40:
      alert("Down");
      break; //Down key
    default:
      alert(code); //Everything else
  }
}

const GameWindow: React.FC<IGameWindow> = (props: IGameWindow) => {
  const containerStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  let root = document.getElementById("root");
  const canvasRef: any = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef?.current;
    canvas.focus();
    // canvas.focus();
    const context: CanvasRenderingContext2D =
      canvasRef?.current?.getContext("2d");

    context.fillStyle = "red";
    context.fillRect(0, 0, props.width, props.height);

    //   root?.addEventListener("keypress", )
    canvas?.addEventListener("keydown", () => {
      //   context.fillStyle = "blue";
      //   context.fillRect(0, 0, props.width, props.height);
      context.moveTo(200, 200);
    });
  }, []);

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
      <body>
        <GameWindow width={100} height={100}></GameWindow>
      </body>
    </>
  );
};

export default Game;
