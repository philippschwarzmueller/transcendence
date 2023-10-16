import React, { useRef, useEffect } from "react";
import properties, {
  IGame,
  ballSpawn,
  gameSpawn,
  IBall,
  IGameSocketPayload,
  IKeyState,
  IGameUser,
} from "./properties";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import {
  drawBackground,
  drawBall,
  drawBothPaddles,
  drawText,
} from "./drawFunctions";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { GAMESOCKET, GAMESOCKETADDRESS } from "../queue/Queue";
import { io, Socket } from "socket.io-client";

interface IGameCanvas {
  background: React.MutableRefObject<HTMLCanvasElement | null>;
  score: React.MutableRefObject<HTMLCanvasElement | null>;
  paddle: React.MutableRefObject<HTMLCanvasElement | null>;
  ball: React.MutableRefObject<HTMLCanvasElement | null>;
}

const finishGame = (
  gameInterval: ReturnType<typeof setInterval> | undefined,
  navigate: NavigateFunction
): void => {
  clearInterval(gameInterval);
  navigate("/home");
};

const GameWindow: React.FC = () => {
  const params = useParams();
  const gameCanvas: IGameCanvas = {
    background: useRef<HTMLCanvasElement | null>(null),
    score: useRef<HTMLCanvasElement | null>(null),
    paddle: useRef<HTMLCanvasElement | null>(null),
    ball: useRef<HTMLCanvasElement | null>(null),
  };
  const keystateRef: React.MutableRefObject<IKeyState> = useRef<IKeyState>({
    down: false,
    up: false,
  });
  const ballRef: React.MutableRefObject<IBall> = useRef<IBall>(ballSpawn);
  const gameStateRef: React.MutableRefObject<IGame> = useRef<IGame>(gameSpawn);
  const gameIdRef: React.MutableRefObject<string> = useRef<string>(
    params.gameId !== undefined ? params.gameId : "-1"
  );
  const gameInterval: React.MutableRefObject<
    ReturnType<typeof setInterval> | undefined
  > = useRef<ReturnType<typeof setInterval>>();
  const navigate = useNavigate();
  const localUser: React.MutableRefObject<IGameUser> = useRef<IGameUser>({
    userId: "placeholder",
  });
  let socket: Socket = GAMESOCKET;
  if (socket === undefined || socket.connected === false)
    socket = io(GAMESOCKETADDRESS);
  const GameLoop = (keyState: React.MutableRefObject<IKeyState>): void => {
    if (
      gameCanvas.background === undefined ||
      gameCanvas.score === undefined ||
      gameCanvas.paddle === undefined ||
      gameCanvas.ball === undefined
    ) {
      finishGame(gameInterval.current, navigate);
    }
    const gameSocketPayload: IGameSocketPayload = {
      side: `${params.side}`,
      keystate: keyState.current,
      gameId: gameIdRef.current,
      user: localUser.current,
    };
    if (socket.connected)
      socket.emit("gamestate", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
      });
    else gameStateRef.current = gameSpawn;
    ballRef.current = gameStateRef.current.ball;
    drawBall(gameCanvas.ball?.current?.getContext("2d"), ballRef.current);
    drawBothPaddles(
      gameCanvas.paddle?.current?.getContext("2d"),
      gameStateRef.current
    );
    drawText(
      gameCanvas.score?.current?.getContext("2d"),
      gameStateRef.current.pointsLeft,
      gameStateRef.current.pointsRight
    );
  };

  useEffect(() => {
    drawBackground(gameCanvas.background?.current?.getContext("2d"));
    socket.on("endgame", () => {
      finishGame(gameInterval.current, navigate);
    });
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

    gameInterval.current = setInterval(
      GameLoop,
      1000 / properties.framerate,
      keystateRef
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Centerdiv>
        <div>
          <Gamecanvas
            id="backgroundCanvas"
            ref={gameCanvas.background}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="scoreCanvas"
            ref={gameCanvas.score}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="paddleCanvas"
            ref={gameCanvas.paddle}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="ballCanvas"
            ref={gameCanvas.ball}
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
