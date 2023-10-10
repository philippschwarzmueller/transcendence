import React, { useRef, useEffect, useState } from "react";
import properties, { IGame, ballSpawn, gameSpawn, IPaddle } from "./properties";
import Button from "../button";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import {
  drawBackground,
  drawBall,
  drawBothPaddles,
  drawText,
} from "./drawFunctions";

const BACKEND: string = `http://${window.location.hostname}:${4000}`;

interface IKeyState {
  up: boolean;
  down: boolean;
}

const fetchGameState = async (
  gameId: number,
  localPaddle: IPaddle
): Promise<IGame> => {
  const response = await fetch(`${BACKEND}/games/gamestate/${gameId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(localPaddle),
  });
  const ball: IGame = await response.json();
  return ball;
};

const stopAllGames = async (): Promise<void> => {
  await fetch(`${BACKEND}/games/stopall`, {
    method: "POST",
  });
};

const GameWindow: React.FC = () => {
  const backgroundRef: any = useRef<HTMLCanvasElement | null>(null);
  const scoreRef: any = useRef<HTMLCanvasElement | null>(null);
  const paddleRef: any = useRef<HTMLCanvasElement | null>(null);
  const ballRef: any = useRef<HTMLCanvasElement | null>(null);
  const keyState = useRef<IKeyState>({ down: false, up: false });
  let [ball, setBall] = useState(ballSpawn);
  let [oldBall, setOldBall] = useState(ballSpawn);
  const gameState = useRef<IGame>(gameSpawn);
  const gameId = useRef<number>(0);
  const localPaddle = useRef<IPaddle>({
    side: "",
    height: properties.window.height / 2,
  });

  const GameLoop = async (
    keyState: React.MutableRefObject<IKeyState>
  ): Promise<void> => {
    const step: number = Math.floor(
      properties.paddle.speed / properties.framerate
    );
    if (
      keyState.current.down === true &&
      keyState.current.up === false &&
      localPaddle.current.height + step < properties.window.height
    ) {
      localPaddle.current.height += step;
    } else if (
      keyState.current.up === true &&
      keyState.current.down === false &&
      localPaddle.current.height - step > 0
    ) {
      localPaddle.current.height -= step;
    }
    gameState.current = await fetchGameState(
      gameId.current,
      localPaddle.current
    );
    setBall(gameState.current.ball);
  };

  const spawnGame = async (): Promise<void> => {
    const incomingGameId = await fetch(`${BACKEND}/games/start`, {
      method: "POST",
    });
    gameId.current = await incomingGameId.json();
  };

  const stop = async (): Promise<void> => {
    await fetch(`${BACKEND}/games/stop/${gameId.current}`, {
      method: "POST",
    });
  };

  const joinLeftPlayer = (): void => {
    localPaddle.current.side = "left";
  };

  const joinRightPlayer = (): void => {
    localPaddle.current.side = "right";
  };

  useEffect(() => {
    drawBackground(backgroundRef.current.getContext("2d"));
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowUp") keyState.current.up = true;
        if (e.key === "ArrowDown") keyState.current.down = true;
      },
      true
    );

    window.addEventListener(
      "keyup",
      (e) => {
        if (e.key === "ArrowUp") keyState.current.up = false;
        if (e.key === "ArrowDown") keyState.current.down = false;
      },
      true
    );

    /*const interval = */ setInterval(
      GameLoop,
      1000 / properties.framerate,
      keyState
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    drawBothPaddles(
      paddleRef.current.getContext("2d"),
      gameState.current.left.height,
      gameState.current.right.height
    );
  }, [gameState.current.left.height, gameState.current.right.height]);

  useEffect(() => {
    drawText(
      scoreRef.current.getContext("2d"),
      gameState.current.pointsLeft,
      gameState.current.pointsRight
    );
  }, [gameState.current.pointsLeft, gameState.current.pointsRight]);

  useEffect(() => {
    const canvas: HTMLCanvasElement = ballRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D = ballRef.current.getContext("2d");

    drawBall(context, ball, oldBall);

    setOldBall(ball);
  }, [ball, oldBall]);

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
            ref={backgroundRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="scoreCanvas"
            ref={scoreRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="paddleCanvas"
            ref={paddleRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={0}
          ></Gamecanvas>
        </div>
        <div>
          <Gamecanvas
            id="ballCanvas"
            ref={ballRef}
            width={properties.window.width}
            height={properties.window.height}
            tabIndex={1}
          ></Gamecanvas>
        </div>
      </Centerdiv>

      <Centerdiv>
        <p>Gameid: {gameState.current.gameId}</p>
      </Centerdiv>
      <Centerdiv>
        <p>
          Left Player Points: {gameState.current.pointsLeft} Right Player
          Points: {gameState.current.pointsRight}
        </p>
      </Centerdiv>
    </>
  );
};

export default GameWindow;
