import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { io } from "socket.io-client";

const GAMESOCKET: string = `ws://${window.location.hostname}:${6969}`;

const queueUp = (socket: any): void => {
  socket.emit("queue", "hello world");
};

const Queue: React.FC = () => {
  const socket = io(GAMESOCKET);
  const nav = useNavigate();
  socket.on("queue found", (body) => {
    nav(`/game/${body.gameId}/${body.side}`);
  });

  return (
    <>
      <Centerdiv>
        <Button
          onClick={() => {
            queueUp(socket);
          }}
        >
          Queue up
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
