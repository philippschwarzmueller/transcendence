import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { IGameStart, IGameUser } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";
import { AuthContext, IUser } from "../../context/auth";

interface RefreshProviderProps {
  children: JSX.Element[];
}

interface IChangeSocketPayload {
  intraname: string | undefined;
}

const SocketRefresh: React.FC<RefreshProviderProps> = ({ children }) => {
  const user: IUser = useContext(AuthContext).user;
  const [cookies, setCookie, removeCookie] = useCookies(["queue"]);
  const socket: Socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [test, setTest] = useState(true);
  useEffect(() => {
    // console.log("RefreshProvider mounted");

    // const handleQueueFound = (body: IGameStart) => {
    //   console.log("Queue found event received");
    //   removeCookie("queue");
    //   navigate(`/play/${body.gameId}/${body.side}`);
    // };
    // socket.on("queue found", handleQueueFound);

    const emitChangeSocket = () => {
      const payload: IChangeSocketPayload = { intraname: user.intraname };
      console.log(payload, payload);
      socket.emit("changesocket", payload, (res: string) => {
        console.log("res", res);
      });
    };

    // // Emit changesocket once when the component mounts
    emitChangeSocket();

    return () => {
      // console.log("RefreshProvider unmounted");
      // Cleanup logic (if needed)
      // socket.off("queue found", handleQueueFound);
    };
  }, []);

  return <>{children}</>;
};

export default SocketRefresh;
