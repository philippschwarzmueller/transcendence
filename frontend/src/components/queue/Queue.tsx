import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext } from "react";
import { SocketContext } from "../../context/socket";

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
  const socket: Socket = useContext(SocketContext);
  const user: IUser = useContext(AuthContext).user;
  console.log(user);
  const navigate = useNavigate();
  socket.on("queue found", (body: IGameStart) => {
    navigate(`/play/${body.gameId}/${body.side}`);
  });
  return (
    <>
      <Centerdiv>
        <Button
          onClick={() => {
            queueUp(socket, user, props.gamemode);
          }}
        >
          {gameModeNames.get(props.gamemode)}
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
