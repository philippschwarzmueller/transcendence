import React, { useRef, useEffect, useContext, useState } from "react";
import properties, {
  IGame,
  gameSpawn,
  IGameSocketPayload,
  IKeyState,
  IFinishedGame,
} from "./properties";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import {
  drawBackground,
  drawBall,
  drawBothPaddles,
  drawText,
  drawWinScreen,
  drawErrorScreen,
} from "./drawFunctions";
import { useParams } from "react-router-dom";
import { EGamemode, GAMESOCKET, GAMESOCKETADDRESS } from "../queue/Queue";
import { io, Socket } from "socket.io-client";
import { AuthContext, IUser } from "../../context/auth";

interface IGameCanvas {
  background: React.MutableRefObject<HTMLCanvasElement | null>;
  score: React.MutableRefObject<HTMLCanvasElement | null>;
  paddle: React.MutableRefObject<HTMLCanvasElement | null>;
  ball: React.MutableRefObject<HTMLCanvasElement | null>;
  endScreen: React.MutableRefObject<HTMLCanvasElement | null>;
}

const finishGame = (
  gameInterval: ReturnType<typeof setInterval> | undefined
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
    left: false,
    right: false,
  });
  const gameStateRef: React.MutableRefObject<IGame> = useRef<IGame>(gameSpawn);
  const gameId: string = params.gameId !== undefined ? params.gameId : "-1";
  const gameInterval: React.MutableRefObject<
    ReturnType<typeof setInterval> | undefined
  > = useRef<ReturnType<typeof setInterval>>();
  const localUser: IUser = useContext(AuthContext).user;
  let socket: Socket = GAMESOCKET;
  let isGameFinished: React.MutableRefObject<boolean> = useRef<boolean>(false);
  if (socket === undefined || socket.connected === false)
    socket = io(GAMESOCKETADDRESS);

  const [navigateToEndScreen, setNavigateToEndScreen] = useState(false);
  const [navigateToErrorScreen, setNavigateToErrorScreen] = useState(false);

  const GameLoop = (): void => {
    if (
      gameCanvas.background === undefined ||
      gameCanvas.score === undefined ||
      gameCanvas.paddle === undefined ||
      gameCanvas.ball === undefined
    ) {
      finishGame(gameInterval.current);
    }
    const gameSocketPayload: IGameSocketPayload = {
      side: params.side !== undefined ? params.side : "viewer",
      keystate: keystateRef.current,
      gameId: gameId,
      user: localUser,
    };
    if (socket.connected) {
      console.log(gameSocketPayload.keystate);
      socket.emit("alterGameData", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
        isGameFinished.current = res.isFinished;
      });
    } else gameStateRef.current = gameSpawn;
    if (isGameFinished.current === true)
      drawWinScreen(
        gameStateRef.current.winner?.name,
        Math.max(
          gameStateRef.current.pointsLeft,
          gameStateRef.current.pointsRight
        ),
        Math.min(
          gameStateRef.current.pointsLeft,
          gameStateRef.current.pointsRight
        ),
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
    socket.emit(
      "getGameFromDatabase",
      gameId,
      (finishedGame: IFinishedGame) => {
        if (navigateToEndScreen)
          drawWinScreen(
            finishedGame.winner,
            finishedGame.winnerPoints,
            finishedGame.looserPoints,
            gameCanvas.endScreen.current?.getContext("2d")
          );
      }
    );
  }, [navigateToEndScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (navigateToErrorScreen)
      drawErrorScreen(gameCanvas.endScreen.current?.getContext("2d"));
  }, [navigateToErrorScreen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    socket.emit("isGameRunning", gameId, (isGameRunning: boolean) => {
      if (!isGameRunning) {
        socket.emit("isGameInDatabase", gameId, (isGameInDatabase: boolean) => {
          if (isGameInDatabase) {
            setNavigateToEndScreen(true);
          } else {
            setNavigateToErrorScreen(true);
          }
        });
      }
    });

    drawBackground(
      EGamemode.roomMovement,
      gameCanvas.background?.current?.getContext("2d")
    );
    socket.on("endgame", () => {
      isGameFinished.current = true;
      finishGame(gameInterval.current);
      socket.emit("getGameData", gameId, (res: IGame) => {
        gameStateRef.current = res;
        isGameFinished.current = res.isFinished;
      });
    });
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowUp") keystateRef.current.up = true;
        if (e.key === "ArrowDown") keystateRef.current.down = true;
        if (e.key === "ArrowLeft") keystateRef.current.left = true;
        if (e.key === "ArrowRight") keystateRef.current.right = true;
      },
      true
    );

    window.addEventListener(
      "keyup",
      (e) => {
        if (e.key === "ArrowUp") keystateRef.current.up = false;
        if (e.key === "ArrowDown") keystateRef.current.down = false;
        if (e.key === "ArrowLeft") keystateRef.current.left = false;
        if (e.key === "ArrowRight") keystateRef.current.right = false;
      },
      true
    );

    gameInterval.current = setInterval(GameLoop, 1000 / properties.framerate);
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
