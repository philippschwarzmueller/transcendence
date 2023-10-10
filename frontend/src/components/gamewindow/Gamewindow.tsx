import React, { useRef, useEffect } from "react";
import properties, {
  IGame,
  ballSpawn,
  gameSpawn,
  IPaddle,
  IBall,
  IGameSocketPayload,
} from "./properties";
import Button from "../button";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import {
  drawBackground,
  drawBall,
  drawBothPaddles,
  drawText,
} from "./drawFunctions";
import { io } from "socket.io-client";

const GAMESOCKET: string = `ws://${window.location.hostname}:${6969}`;

interface IKeyState {
  up: boolean;
  down: boolean;
}

const movePaddle = (keyState: any, localPaddleRef: any): void => {
  const step: number = Math.floor(
    properties.paddle.speed / properties.framerate
  );
  if (
    keyState.current.down === true &&
    keyState.current.up === false &&
    localPaddleRef.current.height + step < properties.window.height
  ) {
    localPaddleRef.current.height += step;
  } else if (
    keyState.current.up === true &&
    keyState.current.down === false &&
    localPaddleRef.current.height - step > 0
  ) {
    localPaddleRef.current.height -= step;
  }
};

const GameWindow: React.FC = () => {
  const backgroundCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const scoreCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const paddleCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const ballCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const keystateRef = useRef<IKeyState>({ down: false, up: false });
  const ballRef: any = useRef<IBall>(ballSpawn);
  const gameStateRef = useRef<IGame>(gameSpawn);
  const gameIdRef = useRef<number>(-1);
  const localPaddleRef = useRef<IPaddle>({
    side: "",
    height: properties.window.height / 2,
  });
  const socketRef = useRef(io(""));

  console.log("init");
  const GameLoop = (keyState: React.MutableRefObject<IKeyState>): void => {
    console.log("gameloop");
    const gameSocketPayload: IGameSocketPayload = {
      paddle: localPaddleRef.current,
      gameId: gameIdRef.current,
    };
    if (socketRef.current.connected)
      socketRef.current.emit("gamestate", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
      });
    else gameStateRef.current = gameSpawn;
    movePaddle(keyState, localPaddleRef);
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

  const spawnGame = (): void => {
    socketRef.current = io(GAMESOCKET, {
      transports: ["websocket"],
      upgrade: false,
    });
    socketRef.current.emit("start", null, (res: number) => {
      gameIdRef.current = res;
    });
  };

  const stop = (): void => {
    socketRef.current.emit("stop", gameIdRef.current);
    socketRef.current.disconnect();
  };

  const stopAllGames = (): void => {
    socketRef.current.emit("stopall");
    socketRef.current.disconnect();
  };
  const joinLeftPlayer = (): void => {
    localPaddleRef.current.side = "left";
  };

  const joinRightPlayer = (): void => {
    localPaddleRef.current.side = "right";
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
      <div>
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
      </div>
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
