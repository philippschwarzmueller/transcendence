import Button from "../button";
import Centerdiv from "../centerdiv";
import { io } from "socket.io-client";

const GAMESOCKET: string = `ws://${window.location.hostname}:${6969}`;

const queueUp = (): void => {
  const socket = io(GAMESOCKET);
  socket.emit("queue", "hello world");
  socket.on("queue found", (body) => {
    alert(body);
  });
};

const Queue: React.FC = () => {
  return (
    <>
      <Centerdiv>
        <Button onClick={queueUp}>Queue up</Button>
      </Centerdiv>
    </>
  );
};

export default Queue;
