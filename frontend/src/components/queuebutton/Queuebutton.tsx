import { NavigateFunction, useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext, useEffect } from "react";
import { SocketContext } from "../../context/socket";
import { useCookies } from "react-cookie";
import styled from "styled-components";
import { IQueueContext, QueueContext } from "../../context/queue";

const LocalQueueButton = styled(Button)`
  padding: 8px;
  margin-right: 8px;
`;

export enum EGamemode {
  standard = 1,
  roomMovement = 2,
}
export const gameModeNames: Map<EGamemode, string> = new Map([
  [EGamemode.standard, "PONG Original"],
  [EGamemode.roomMovement, "PONG 2D"],
]);

export interface IQueueProps {
  gamemode: EGamemode;
}

export interface IQueuePayload {
  user: IUser;
  gamemode: EGamemode;
}

export interface IQueueCookie {
  intraname: string;
  timestamp: number;
}

const Queuebutton: React.FC<IQueueProps> = (
  props: IQueueProps = { gamemode: EGamemode.standard }
) => {
  const socket: Socket = useContext(SocketContext);
  const user: IUser = useContext(AuthContext).user;
  const navigate: NavigateFunction = useNavigate();
  const [, setCookie, removeCookie] = useCookies(["queue"]);
  const queue: IQueueContext = useContext(QueueContext);

  useEffect(() => {
    socket.on("queue found", (body: IGameStart) => {
      removeCookie("queue");
      queue.setQueueFound(true);
    });

    socket.on("game found", (body: IGameStart) => {
      removeCookie("queue");
      queue.setQueueFound(false);
      navigate(`/play/${body.gameId}/${body.side}`);
    });

    socket.on("game denied", (body: IGameStart) => {
      removeCookie("queue");
    });
  }, [navigate, removeCookie, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  const queueUp = (socket: Socket, user: IUser, gamemode: EGamemode): void => {
    if (user.intraname !== undefined) {
      const cookie: IQueueCookie = {
        intraname: user.intraname,
        timestamp: Date.now(),
      };
      setCookie("queue", cookie, { path: "/" });
    }
    socket.emit("queue", { user: user, gamemode: gamemode });
  };

  return (
    <>
      <Centerdiv>
        <LocalQueueButton
          onClick={() => {
            if (!queue.queueFound) queueUp(socket, user, props.gamemode);
          }}
        >
          {gameModeNames.get(props.gamemode)}
        </LocalQueueButton>
      </Centerdiv>
    </>
  );
};

export default Queuebutton;
