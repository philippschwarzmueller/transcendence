import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { io, Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";

const GAMESOCKETADDRESS: string = `ws://${window.location.hostname}:${6969}`;

export let GAMESOCKET: Socket;

const queueUp = (socket: Socket): void => {
  socket.emit("queue");
};

const Queue: React.FC = () => {
  GAMESOCKET = io(GAMESOCKETADDRESS);
  const nav = useNavigate();
  GAMESOCKET.on("queue found", (body: IGameStart) => {
    nav(`/play/${body.gameId}/${body.side}`);
  });

  return (
    <>
      <Centerdiv>
        <Button
          onClick={() => {
            queueUp(GAMESOCKET);
          }}
        >
          Queue up
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
