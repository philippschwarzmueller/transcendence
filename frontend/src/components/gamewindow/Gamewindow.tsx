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
  const socket: Socket = useContext(SocketContext);

  const [navigateToEndScreen, setNavigateToEndScreen] = useState(false);
  const [navigateToErrorScreen, setNavigateToErrorScreen] = useState(false);
  let resize = 0;
  const handleWindowResize = (): void => {
    // alert("fullscreen");
    calculateWindowproperties(getWindowDimensions());
    const canvas1 = gameCanvas?.background?.current?.getContext("2d")?.canvas;
    if (canvas1) {
      canvas1.height = properties.window.height;
      canvas1.width = properties.window.width;
    }
    const canvas2 = gameCanvas?.ball?.current?.getContext("2d")?.canvas;
    if (canvas2) {
      canvas2.height = properties.window.height;
      canvas2.width = properties.window.width;
    }
    const canvas3 = gameCanvas?.endScreen?.current?.getContext("2d")?.canvas;
    if (canvas3) {
      canvas3.height = properties.window.height;
      canvas3.width = properties.window.width;
    }
    const canvas4 = gameCanvas?.paddle?.current?.getContext("2d")?.canvas;
    if (canvas4) {
      canvas4.height = properties.window.height;
      canvas4.width = properties.window.width;
    }
    const canvas5 = gameCanvas?.score?.current?.getContext("2d")?.canvas;
    if (canvas5) {
      canvas5.height = properties.window.height;
      canvas5.width = properties.window.width;
    }
    resize++;
    console.log(resize);
    socket.emit("getGamemode", gameId, (gamemode: EGamemode) => {
      if (gamemode !== undefined && gamemode !== null)
        console.log("draw background");
      drawBackground(
        gamemode,
        gameCanvas.background?.current?.getContext("2d")
      );
    });
  };

  // useEffect(() => {
  //   // calculateWindowproperties(windowDimensions);
  //   socket.emit("getGamemode", gameId, (gamemode: EGamemode) => {
  //     if (gamemode !== undefined && gamemode !== null)
  //       drawBackground(
  //         gamemode,
  //         gameCanvas.background?.current?.getContext("2d")
  //       );
  //   });
  // }, [resize]); // eslint-disable-line react-hooks/exhaustive-deps

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
    handleWindowResize();
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

    socket.emit("getGamemode", gameId, (gamemode: EGamemode) => {
      if (gamemode !== undefined && gamemode !== null)
        drawBackground(
          gamemode,
          gameCanvas.background?.current?.getContext("2d")
        );
    });

    socket.on("endgame", () => {
      finishGame(gameInterval.current);
      socket.emit("getGameData", gameId, (res: IGame) => {
        gameStateRef.current = res;
        setNavigateToEndScreen(true);
      });
    });

    setKeyEventListener(keystateRef);

    gameInterval.current = setInterval(GameLoop, 1000 / properties.framerate);

    window.addEventListener("resize", handleWindowResize);
    // window.addEventListener("fullscreenchange", handleFullScreenChange);
    // window.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      // window.removeEventListener("fullscreenchange", handleFullScreenChange);
      // window.removeEventListener(
      //   "webkitfullscreenchange",
      //   handleFullScreenChange
      // );
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
