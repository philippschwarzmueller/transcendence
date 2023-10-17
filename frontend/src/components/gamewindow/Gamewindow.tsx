import React, { useRef, useEffect } from "react";
import properties, {
  IGame,
  gameSpawn,
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
  drawEndScreen,
} from "./drawFunctions";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { GAMESOCKET, GAMESOCKETADDRESS } from "../queue/Queue";
import { io, Socket } from "socket.io-client";

interface IGameCanvas {
  background: React.MutableRefObject<HTMLCanvasElement | null>;
  score: React.MutableRefObject<HTMLCanvasElement | null>;
  paddle: React.MutableRefObject<HTMLCanvasElement | null>;
  ball: React.MutableRefObject<HTMLCanvasElement | null>;
  endScreen: React.MutableRefObject<HTMLCanvasElement | null>;
}

const finishGame = (
  gameInterval: ReturnType<typeof setInterval> | undefined,
  navigate: NavigateFunction
): void => {
  clearInterval(gameInterval);
};

const GameWindow: React.FC = () => {
  const params = useParams();
  const gameCanvas: IGameCanvas = {
    background: useRef<HTMLCanvasElement | null>(null),
    score: useRef<HTMLCanvasElement | null>(null),
    paddle: useRef<HTMLCanvasElement | null>(null),
    ball: useRef<HTMLCanvasElement | null>(null),
    endScreen: useRef<HTMLCanvasElement | null>(null),
  };
  const keystateRef: React.MutableRefObject<IKeyState> = useRef<IKeyState>({
    down: false,
    up: false,
  });
  const gameStateRef: React.MutableRefObject<IGame> = useRef<IGame>(gameSpawn);
  const gameId: string = params.gameId !== undefined ? params.gameId : "-1";
  const gameInterval: React.MutableRefObject<
    ReturnType<typeof setInterval> | undefined
  > = useRef<ReturnType<typeof setInterval>>();
  const navigate = useNavigate();
  const localUser: string | null = sessionStorage.getItem("user");
  let socket: Socket = GAMESOCKET;
  let isGameFinished: React.MutableRefObject<boolean> = useRef<boolean>(false);

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
      side: params.side !== undefined ? params.side : "viewer",
      keystate: keyState.current,
      gameId: gameId,
      user: localUser,
    };
    if (socket.connected)
      socket.emit("gamestate", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
        isGameFinished.current = res.isFinished;
      });
    else gameStateRef.current = gameSpawn;
    if (isGameFinished.current === true)
      drawEndScreen(
        gameStateRef.current,
        gameCanvas.endScreen?.current?.getContext("2d")
      );
    else {
      drawBall(
        gameCanvas.ball?.current?.getContext("2d"),
        gameStateRef.current.ball
      );
      drawBothPaddles(
        gameCanvas.paddle?.current?.getContext("2d"),
        gameStateRef.current
      );
      drawText(
        gameCanvas.score?.current?.getContext("2d"),
        gameStateRef.current.pointsLeft,
        gameStateRef.current.pointsRight
      );
    }
  };

  useEffect(() => {
    drawBackground(gameCanvas.background?.current?.getContext("2d"));
    socket.on("endgame", () => {
      isGameFinished.current = true;
      finishGame(gameInterval.current, navigate);
      const gameSocketPayload: IGameSocketPayload = {
        side: params.side !== undefined ? params.side : "viewer",
        keystate: keystateRef.current,
        gameId: gameId,
        user: localUser,
      };
      socket.emit("gamestate", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
        isGameFinished.current = res.isFinished;
      });
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
          <Gamecanvas
            id="endScreenCanvas"
            ref={gameCanvas.endScreen}
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
