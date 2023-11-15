import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext, useEffect } from "react";
import { SocketContext } from "../../context/socket";
import { useCookies } from "react-cookie";
import styled from "styled-components";

const LocalQueueButton = styled(Button)`
  padding: 8px;
  margin-right: 8px;
`;

export enum EGamemode {
  standard = 1,
  roomMovement = 2,
}
const gameModeNames: Map<EGamemode, string> = new Map([
  [EGamemode.standard, "Standard"],
  [EGamemode.roomMovement, "2D Movement"],
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

const Queue: React.FC<IQueueProps> = (
  props: IQueueProps = { gamemode: EGamemode.standard }
) => {
  const socket: Socket = useContext(SocketContext);
  const user: IUser = useContext(AuthContext).user;
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["queue"]);

  useEffect(() => {
    socket.on("queue found", (body: IGameStart) => {
      removeCookie("queue");
      navigate(`/play/${body.gameId}/${body.side}`);
      console.log("queue found");
    });
  }, []);

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
            queueUp(socket, user, props.gamemode);
          }}
        >
          {gameModeNames.get(props.gamemode)}
        </LocalQueueButton>
      </Centerdiv>
    </>
  );
};

export default Queue;
