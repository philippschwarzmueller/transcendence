import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { io, Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext } from "react";

export const GAMESOCKETADDRESS: string = `ws://${
  window.location.hostname
}:${6969}`;

export let GAMESOCKET: Socket;

const queueUp = (socket: Socket, user: IUser, gamemode: EGamemode): void => {
  socket.emit("queue", { user: user, gamemode: gamemode });
};

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

const Queue: React.FC<IQueueProps> = (
  props: IQueueProps = { gamemode: EGamemode.standard }
) => {
  const user: IUser = useContext(AuthContext).user;
  GAMESOCKET = io(GAMESOCKETADDRESS);
  const navigate = useNavigate();
  GAMESOCKET.on("queue found", (body: IGameStart) => {
    navigate(`/play/${body.gameId}/${body.side}`);
  });
  return (
    <>
      <Centerdiv>
        <Button
          onClick={() => {
            queueUp(GAMESOCKET, user, props.gamemode);
          }}
        >
          {gameModeNames.get(props.gamemode)}
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
