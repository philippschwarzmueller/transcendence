import { useNavigate } from "react-router-dom";
import Button from "../button";
import Centerdiv from "../centerdiv";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { AuthContext, IUser } from "../../context/auth";
import { useContext, useEffect } from "react";
import { SocketContext } from "../../context/socket";
// import Cookies from "universal-cookie";
import { CookiesProvider, useCookies } from "react-cookie";

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
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["queue"]);

  useEffect(() => {
    socket.on("queue found", (body: IGameStart) => {
      removeCookie("queue");
      navigate(`/play/${body.gameId}/${body.side}`);
    });
  }, []);

  const queueUp = (socket: Socket, user: IUser, gamemode: EGamemode): void => {
    // const cookies = new Cookies();
    // cookies.set("queue", "true", { path: "/" });
    if (user.intraname !== undefined)
      setCookie("queue", user.intraname, { path: "/" });
    socket.emit("queue", { user: user, gamemode: gamemode });
  };

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
