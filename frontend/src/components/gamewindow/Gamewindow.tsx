import React, { useRef, useEffect, useContext } from "react";
import properties, {
  IGame,
  gameSpawn,
  IGameSocketPayload,
  IKeyState,
  IFinishedGame,
} from "./properties";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import { drawWinScreen, drawErrorScreen, drawGame } from "./drawFunctions";
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

export interface IGameCanvas {
  background: React.MutableRefObject<HTMLCanvasElement>;
  score: React.MutableRefObject<HTMLCanvasElement>;
  paddle: React.MutableRefObject<HTMLCanvasElement>;
  ball: React.MutableRefObject<HTMLCanvasElement>;
  endScreen: React.MutableRefObject<HTMLCanvasElement>;
}

const finishGame = (
  gameInterval: ReturnType<typeof setInterval> | undefined
): void => {
  clearInterval(gameInterval);
};

const resizeCanvas = (
  gameCanvasRef: React.MutableRefObject<HTMLCanvasElement>
): void => {
  const canvas = gameCanvasRef.current.getContext("2d")?.canvas;
  if (canvas) {
    canvas.height = properties.window.height;
    canvas.width = properties.window.width;
  }
};

const getCanvasList = (
  gameCanvas: IGameCanvas
): React.MutableRefObject<HTMLCanvasElement>[] => {
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
  gameCanvas: React.MutableRefObject<HTMLCanvasElement>
): void => {
  socket.emit(
    "getGameFromDatabase",
    gameId,
    (finishedGameRemote: IFinishedGame) => {
      drawWinScreen(
        finishedGameRemote.winner,
        finishedGameRemote.winnerPoints,
        finishedGameRemote.looserPoints,
        gameCanvas.current.getContext("2d")
      );
    }
  );
};

const GameWindow: React.FC = () => {
  const params = useParams();
  const gameCanvas: IGameCanvas = {
    background: useRef<HTMLCanvasElement>(document.createElement("canvas")),
    score: useRef<HTMLCanvasElement>(document.createElement("canvas")),
    paddle: useRef<HTMLCanvasElement>(document.createElement("canvas")),
    ball: useRef<HTMLCanvasElement>(document.createElement("canvas")),
    endScreen: useRef<HTMLCanvasElement>(document.createElement("canvas")),
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

  const handleWindowResize = (): void => {
    calculateWindowproperties(getWindowDimensions());
    getCanvasList(gameCanvas).forEach((canvas) => {
      resizeCanvas(canvas);
    });

    if (navigateToErrorScreen.current) {
      drawErrorScreen(gameCanvas.endScreen.current.getContext("2d"));
    } else if (navigateToEndScreen.current) {
      fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
    } else {
      drawGame(gamemode, gameCanvas, gameStateRef);
    }
  };

  const GameLoop = (): void => {
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
    } else {
      gameStateRef.current = gameSpawn;
    }

    drawGame(gamemode, gameCanvas, gameStateRef);
  };

  useEffect(() => {
    handleWindowResize();

    socket.emit("isGameRunning", gameId, (isGameRunning: boolean) => {
      if (!isGameRunning) {
        socket.emit("isGameInDatabase", gameId, (isGameInDatabase: boolean) => {
          if (isGameInDatabase) {
            navigateToEndScreen.current = true;
            fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
          } else {
            navigateToErrorScreen.current = true;
            drawErrorScreen(gameCanvas.endScreen.current.getContext("2d"));
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
      finishGame(gameInterval.current);
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
