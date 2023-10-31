import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { io, Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext } from "react";
import { SocketContext } from "../../context/socket";

const queueUp = (socket: Socket, user: IUser): void => {
  socket.emit("queue", user);
};

const Queue: React.FC = () => {
  const socket: Socket = useContext(SocketContext);
  const user: IUser = useContext(AuthContext).user;
  const navigate = useNavigate();
  socket.on("queue found", (body: IGameStart) => {
    navigate(`/play/${body.gameId}/${body.side}`);
  });

  return (
    <>
      <Centerdiv>
        <Button
          onClick={() => {
            queueUp(socket, user);
          }}
        >
          Queue up
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
