import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { io } from "socket.io-client";

const GAMESOCKET: string = `ws://${window.location.hostname}:${6969}`;

export let gamesocket: any;
const queueUp = (socket: any): void => {
  socket.emit("queue", "hello world");
};

const Queue: React.FC = () => {
  gamesocket = io(GAMESOCKET);
  const nav = useNavigate();
  gamesocket.on("queue found", (body: any) => {
    nav(`/play/${body.gameId}/${body.side}`);
  });

  return (
    <>
      <Centerdiv>
        <Button
          onClick={() => {
            queueUp(gamesocket);
          }}
        >
          Queue up
        </Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
