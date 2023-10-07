import React, { useRef, useEffect, useState } from "react";
import properties, {
  IBall,
  IGame,
  ballSpawn,
  gameSpawn,
  IPaddle,
} from "./properties";
import Button from "../button";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas";

interface IKeyState {
  up: boolean;
  down: boolean;
}

const fetchGameState = async (
  gameId: number,
  localPaddle: IPaddle
): Promise<IGame> => {
  const response = await fetch(
    `http://localhost:4000/games/gamestate/${gameId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localPaddle),
    }
  );
  const ball: IGame = await response.json();
  return ball;
};

const stopAllGames = async (): Promise<void> => {
  await fetch(`http://localhost:4000/games/stopall`, {
    method: "POST",
  });
};

const drawPaddle = (
  context: CanvasRenderingContext2D,
  side: string,
  height: number
): void => {
  const paddleHeight: number = Math.floor(
    (properties.window.height * properties.paddle.height) / 100
  );
  const paddleWidth: number = Math.floor(
    (properties.window.width * properties.paddle.width) / 100
  );
  if (side === "left") {
    context.fillStyle = properties.window.color;
    context.clearRect(0, 0, paddleWidth, properties.window.height);
    context.fillStyle = properties.paddle.color;
    context.fillRect(0, height - paddleHeight / 2, paddleWidth, paddleHeight);
  } else if (side === "right") {
    context.fillStyle = properties.window.color;
    context.clearRect(
      properties.window.width - paddleWidth,
      0,
      paddleWidth,
      properties.window.height
    );
    context.fillStyle = properties.paddle.color;
    context.fillRect(
      properties.window.width - paddleWidth,
      height - paddleHeight / 2,
      paddleWidth,
      paddleHeight
    );
  }
};

const drawBall = (
  context: CanvasRenderingContext2D,
  ball: IBall,
  old_ball: IBall
): void => {
  context.clearRect(
    old_ball.x - properties.ballProperties.radius * 2,
    old_ball.y - properties.ballProperties.radius * 2,
    properties.ballProperties.radius * 4,
    properties.ballProperties.radius * 4
  );
  context.fillStyle = properties.ballProperties.color;
  context.beginPath();
  context.arc(ball.x, ball.y, properties.ballProperties.radius, 0, 2 * Math.PI);
  context.fill();
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
    const incomingGameId = await fetch(`http://localhost:4000/games/start`, {
      method: "POST",
    });
    gameId.current = await incomingGameId.json();
  };

  const stop = async (): Promise<void> => {
    await fetch(`http://localhost:4000/games/stop/${gameId.current}`, {
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
    const canvas: HTMLCanvasElement = backgroundRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      backgroundRef.current.getContext("2d");
    context.fillStyle = properties.window.color;
    context.fillRect(0, 0, properties.window.width, properties.window.height);

    window.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "ArrowUp") keyState.current.up = true;
        if (e.key === "ArrowDown") keyState.current.down = true;
      },
      true
    );

    window.addEventListener(
      "keyup",
      function (e) {
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
    const canvas: HTMLCanvasElement = paddleRef.current;
    canvas.focus();
    const context: CanvasRenderingContext2D =
      paddleRef.current.getContext("2d");

    drawPaddle(
      context,
      gameState.current.left.side,
      gameState.current.left.height
    );
    drawPaddle(
      context,
      gameState.current.right.side,
      gameState.current.right.height
    );
  }, [gameState.current.left.height, gameState.current.right.height]);

  useEffect(() => {
    const context: CanvasRenderingContext2D = scoreRef.current.getContext("2d");
    const fontSize: number = properties.window.height / 6;
    context.font = `${fontSize}px Arial`;
    context.fillStyle = "white";
    context.fillText(
      `${gameState.current.pointsLeft}`,
      properties.window.width / 3,
      properties.window.height / 6
    );
    context.fillText(
      `${gameState.current.pointsRight}`,
      (properties.window.width * 2) / 3,
      properties.window.height / 6
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

      <Centerdiv>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute" }}>
            <Gamecanvas
              id="backgroundCanvas"
              ref={backgroundRef}
              width={properties.window.width}
              height={properties.window.height}
              tabIndex={0}
              style={{ border: "3px solid #000000", position: "relative" }}
            ></Gamecanvas>
          </div>
          <div style={{ position: "absolute" }}>
            <Gamecanvas
              id="scoreCanvas"
              ref={scoreRef}
              width={properties.window.width}
              height={properties.window.height}
              tabIndex={0}
              style={{ border: "3px solid #000000", position: "relative" }}
            ></Gamecanvas>
          </div>
          <div style={{ position: "absolute" }}>
            <Gamecanvas
              id="paddleCanvas"
              ref={paddleRef}
              width={properties.window.width}
              height={properties.window.height}
              tabIndex={0}
              style={{ border: "3px solid #000000", position: "relative" }}
            ></Gamecanvas>
          </div>
          <div style={{ position: "absolute" }}>
            <Gamecanvas
              id="ballCanvas"
              ref={ballRef}
              width={properties.window.width}
              height={properties.window.height}
              tabIndex={1}
              style={{ border: "3px solid #000000", position: "relative" }}
            ></Gamecanvas>
          </div>
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
