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

const queueUp = (socket: Socket, user: IUser): void => {
  socket.emit("queue", user);
};

const Queue: React.FC = () => {
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
            queueUp(GAMESOCKET, user);
          }}
        >
          Queue up
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
