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
import { EGamemode } from "../queue/Queue";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { AuthContext, IUser } from "../../context/auth";
import { setKeyEventListener } from "./keyboardinput";
import {
  calculateWindowproperties,
  getWindowDimensions,
} from "./windowresizing";
import { Gamesocket } from "./socket";

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

const resizeCanvas = (
  gameCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>
): void => {
  const canvas = gameCanvasRef.current?.getContext("2d")?.canvas;
  if (canvas) {
    canvas.height = properties.window.height;
    canvas.width = properties.window.width;
  }
};

const getCanvases = (
  gameCanvas: IGameCanvas
): React.MutableRefObject<HTMLCanvasElement | null>[] => {
  return [
    gameCanvas.background,
    gameCanvas.ball,
    gameCanvas.endScreen,
    gameCanvas.paddle,
    gameCanvas.paddle,
    gameCanvas.score,
  ];
};

const fetchAndDrawFinishedGame = (
  socket: Gamesocket,
  gameId: string,
  gameCanvas: React.MutableRefObject<HTMLCanvasElement | null>
): void => {
  socket.emit(
    "getGameFromDatabase",
    gameId,
    (finishedGameRemote: IFinishedGame) => {
      drawWinScreen(
        finishedGameRemote.winner,
        finishedGameRemote.winnerPoints,
        finishedGameRemote.looserPoints,
        gameCanvas?.current?.getContext("2d")
      );
    }
  );
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
  const socket: Socket = useContext(SocketContext);
  const gamemode = useRef(EGamemode.standard);
  const navigateToEndScreen = useRef(false);
  const navigateToErrorScreen = useRef(false);

  const finishedGame: React.MutableRefObject<IFinishedGame | null> =
    useRef(null);
  const handleWindowResize = (): void => {
    console.log("resize");
    calculateWindowproperties(getWindowDimensions());
    getCanvases(gameCanvas).forEach((canvas) => {
      resizeCanvas(canvas);
    });
    console.log("navigateToEndScreen: ", navigateToEndScreen.current);
    console.log("navigateToErrorScreen: ", navigateToErrorScreen.current);

    if (navigateToErrorScreen.current) {
      console.log("rerender error");
      drawErrorScreen(gameCanvas.endScreen.current?.getContext("2d"));
    } else if (navigateToEndScreen.current) {
      console.log("rerender end");
      fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
    }
  };

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
      socket.emit("alterGameData", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
      });
    } else gameStateRef.current = gameSpawn;
    drawBackground(
      gamemode.current,
      gameCanvas.background.current?.getContext("2d")
    );
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
  };

  // useEffect(() => {
  //   console.log("navigateToEndScreenEffect: ", navigateToEndScreen.current);
  //   if (navigateToEndScreen.current)
  //     fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
  // }, [navigateToEndScreen.current]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   console.log("navigateToErrorScreenEffect: ", navigateToErrorScreen.current);
  //   if (navigateToErrorScreen.current)
  //     drawErrorScreen(gameCanvas.endScreen.current?.getContext("2d"));
  // }, [navigateToErrorScreen.current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("Initial render");
    handleWindowResize();
    socket.emit("isGameRunning", gameId, (isGameRunning: boolean) => {
      if (!isGameRunning) {
        socket.emit("isGameInDatabase", gameId, (isGameInDatabase: boolean) => {
          if (isGameInDatabase) {
            navigateToEndScreen.current = true;
            fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
            drawWinScreen(
              finishedGame?.current?.winner,
              finishedGame?.current?.winnerPoints,
              finishedGame?.current?.looserPoints,
              gameCanvas.endScreen.current?.getContext("2d")
            );
          } else {
            drawErrorScreen(gameCanvas.endScreen.current?.getContext("2d"));
            navigateToErrorScreen.current = true;
          }
        });
      }
    });

    socket.emit("getGamemode", gameId, (gamemodeRemote: EGamemode) => {
      gamemode.current = gamemodeRemote;
    });

    socket.on("endgame", () => {
      finishGame(gameInterval.current);
      socket.emit("getGameData", gameId, (res: IGame) => {
        gameStateRef.current = res;
        navigateToEndScreen.current = true;
      });
      fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
    });

    setKeyEventListener(keystateRef);

    gameInterval.current = setInterval(GameLoop, 1000 / properties.framerate);

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
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
