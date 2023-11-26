import React, { useRef, useEffect, useContext } from "react";
import properties, {
  IGame,
  gameSpawn,
  IGameSocketPayload,
  IKeyState,
} from "./properties";
import Centerdiv from "../centerdiv";
import Gamecanvas from "../gamecanvas/Gamecanvas";
import {
  clearAllCanvas,
  drawErrorScreen,
  drawGame,
  fetchAndDrawFinishedGame,
} from "./drawFunctions";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { EGamemode } from "../queuebutton/Queuebutton";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { AuthContext, IAuthContext } from "../../context/auth";
import { setKeyEventListener } from "./keyboardinput";
import {
  calculateWindowproperties,
  getWindowDimensions,
  resizeCanvas,
} from "./windowresizing";
import { validateToken } from "../../routes/PrivateRoute";
import Button from "../button";
import styled from "styled-components";
import Hoverhelp from "../hoverhelp";

export interface IGameCanvas {
  background: React.MutableRefObject<HTMLCanvasElement>;
  score: React.MutableRefObject<HTMLCanvasElement>;
  paddle: React.MutableRefObject<HTMLCanvasElement>;
  ball: React.MutableRefObject<HTMLCanvasElement>;
  endScreen: React.MutableRefObject<HTMLCanvasElement>;
}

const StyledDiv = styled.div`
  border: 4px black;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledButton = styled(Button)`
  z-index: 5;
  margin-top: -22px;
`;

const HoverDiv = styled.div<{ top: number; left: number }>`
  position: absolute;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
`;

const finishGame = (
  gameInterval: ReturnType<typeof setInterval> | undefined
): void => {
  clearInterval(gameInterval);
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
  const auth: IAuthContext = useContext(AuthContext);
  const socket: Socket = useContext(SocketContext);
  const gamemode: React.MutableRefObject<EGamemode> = useRef(
    EGamemode.standard
  );
  const navigateToEndScreen: React.MutableRefObject<boolean> = useRef(false);
  const navigateToErrorScreen: React.MutableRefObject<boolean> = useRef(false);
  const navigate: NavigateFunction = useNavigate();

  const handleWindowResize = (): void => {
    calculateWindowproperties(getWindowDimensions());
    Object.values(gameCanvas).forEach((canvas) => {
      resizeCanvas(canvas);
    });

    if (navigateToErrorScreen.current) {
      drawErrorScreen(gameCanvas.endScreen.current?.getContext("2d"));
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
      user: auth.user,
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
    validateToken(auth);
    handleWindowResize();
    clearAllCanvas(gameCanvas);

    socket.emit("isGameRunning", gameId, (isGameRunning: boolean) => {
      if (!isGameRunning) {
        socket.emit("isGameInDatabase", gameId, (isGameInDatabase: boolean) => {
          if (isGameInDatabase) {
            navigateToEndScreen.current = true;
            fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
          } else {
            navigateToErrorScreen.current = true;
            drawErrorScreen(gameCanvas.endScreen.current?.getContext("2d"));
          }
        });
      }
    });

    socket.emit("getGamemode", gameId, (gamemodeRemote: EGamemode) => {
      gamemode.current = gamemodeRemote;
    });

    socket.on("endgame", (res: string) => {
      if (res === gameId) {
        finishGame(gameInterval.current);
        socket.emit("getGameData", gameId, (res: IGame) => {
          gameStateRef.current = res;
          navigateToEndScreen.current = true;
        });
        fetchAndDrawFinishedGame(socket, gameId, gameCanvas.endScreen);
      }
    });

    setKeyEventListener(keystateRef, navigate);

    gameInterval.current = setInterval(GameLoop, 1000 / properties.framerate);

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      finishGame(gameInterval.current);
    };
  }, [params, auth]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <HoverDiv top={0} left={0}>
        <Hoverhelp />
      </HoverDiv>
      <StyledDiv>
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
        <Centerdiv>
          <StyledButton
            onClick={() => {
              navigate("/home");
            }}
          >
            Leave Game
          </StyledButton>
        </Centerdiv>
      </StyledDiv>
    </>
  );
};

export default GameWindow;
