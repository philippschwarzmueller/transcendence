import React, { useRef, useEffect } from "react";
import properties, {
  IGame,
  ballSpawn,
  gameSpawn,
  IPaddle,
  IBall,
  IGameSocketPayload,
  IKeyState,
} from "./properties";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import {
  drawBackground,
  drawBall,
  drawBothPaddles,
  drawText,
} from "./drawFunctions";
import { useParams } from "react-router-dom";
import { GAMESOCKET } from "../queue/Queue";

const GameWindow: React.FC = () => {
  const params = useParams();
  const backgroundCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const scoreCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const paddleCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const ballCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const keystateRef = useRef<IKeyState>({ down: false, up: false });
  const ballRef: any = useRef<IBall>(ballSpawn);
  const gameStateRef = useRef<IGame>(gameSpawn);
  const gameIdRef = useRef<number>(
    parseInt(params.gameId !== undefined ? params.gameId : "-1")
  );
  const localPaddleRef = useRef<IPaddle>({
    side: `${params.side}`,
    height: properties.window.height / 2,
  });

  const GameLoop = (keyState: React.MutableRefObject<IKeyState>): void => {
    const gameSocketPayload: IGameSocketPayload = {
      side: `${params.side}`,
      keystate: keyState.current,
      gameId: gameIdRef.current,
    };
    if (GAMESOCKET.connected)
      GAMESOCKET.emit("gamestate", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
      });
    else gameStateRef.current = gameSpawn;
    ballRef.current = gameStateRef.current.ball;
    drawBall(ballCanvasRef.current.getContext("2d"), ballRef.current);
    drawBothPaddles(
      paddleCanvasRef.current.getContext("2d"),
      gameStateRef.current
    );
    drawText(
      scoreCanvasRef.current.getContext("2d"),
      gameStateRef.current.pointsLeft,
      gameStateRef.current.pointsRight
    );
  };

  useEffect(() => {
    drawBackground(backgroundCanvasRef.current.getContext("2d"));
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowUp") keystateRef.current.up = true;
        if (e.key === "ArrowDown") keystateRef.current.down = true;
      },
      true
    );

    window.addEventListener(
      "keyup",
      (e) => {
        if (e.key === "ArrowUp") keystateRef.current.up = false;
        if (e.key === "ArrowDown") keystateRef.current.down = false;
      },
      true
    );

    /*const interval = */ setInterval(
      GameLoop,
      1000 / properties.framerate,
      keystateRef
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div></div>
      <Centerdiv>
        <div>
          <Gamecanvas
            id="backgroundCanvas"
            ref={backgroundCanvasRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="scoreCanvas"
            ref={scoreCanvasRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="paddleCanvas"
            ref={paddleCanvasRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="ballCanvas"
            ref={ballCanvasRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={1}
          ></Gamecanvas>
        </div>
      </Centerdiv>
    </>
  );
};

export default GameWindow;
