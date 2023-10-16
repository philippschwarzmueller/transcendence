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
import { GAMESOCKET } from "../queue/Queue";

const finishGame = (
  gameInterval: ReturnType<typeof setInterval> | undefined,
  navigate: NavigateFunction
): void => {
  clearInterval(gameInterval);
  navigate("/home");
};

const GameWindow: React.FC = () => {
  const params = useParams();
  const backgroundCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const scoreCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const paddleCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
  const ballCanvasRef: any = useRef<HTMLCanvasElement | null>(null);
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

  const GameLoop = (keyState: React.MutableRefObject<IKeyState>): void => {
    if (
      ballCanvasRef.current === undefined ||
      backgroundCanvasRef.current === undefined ||
      scoreCanvasRef.current === undefined ||
      paddleCanvasRef.current === undefined
    ) {
      finishGame(gameInterval.current, navigate);
    }
    const gameSocketPayload: IGameSocketPayload = {
      side: `${params.side}`,
      keystate: keyState.current,
      gameId: gameIdRef.current,
      user: localUser.current,
    };
    if (GAMESOCKET.connected)
      GAMESOCKET.emit("gamestate", gameSocketPayload, (res: IGame) => {
        gameStateRef.current = res;
      });
    else gameStateRef.current = gameSpawn;
    ballRef.current = gameStateRef.current.ball;
    drawBall(ballCanvasRef.current?.getContext("2d"), ballRef.current);
    drawBothPaddles(
      paddleCanvasRef.current?.getContext("2d"),
      gameStateRef.current
    );
    drawText(
      scoreCanvasRef.current?.getContext("2d"),
      gameStateRef.current.pointsLeft,
      gameStateRef.current.pointsRight
    );
  };

  useEffect(() => {
    drawBackground(backgroundCanvasRef.current?.getContext("2d"));
    GAMESOCKET.on("endgame", () => {
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
