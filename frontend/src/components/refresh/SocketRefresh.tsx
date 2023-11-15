import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { IGameStart, IGameUser } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";
import { AuthContext, IUser } from "../../context/auth";
import PrivateRoute, { validateToken } from "../../routes/PrivateRoute";

interface RefreshProviderProps {
  children: JSX.Element[];
}

interface IChangeSocketPayload {
  intraname: string;
}

const SocketRefresh: React.FC<RefreshProviderProps> = ({ children }) => {
  const user: IUser = useContext(AuthContext).user;
  const [cookies, setCookie, removeCookie] = useCookies(["queue"]);
  const socket: Socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [test, setTest] = useState(true);
  const auth = useContext(AuthContext);
  useEffect(() => {
    const handleQueueFound = (body: IGameStart) => {
      console.log("Queue found event received");
      removeCookie("queue");
      navigate(`/play/${body.gameId}/${body.side}`);
    };
    socket.on("queue found", handleQueueFound);

    const emitChangeSocket = () => {
      if (user.intraname) {
        const payload: IChangeSocketPayload = { intraname: user.intraname };
        socket.emit("changesocket", payload, (res: string) => {
          console.log("res", res);
        });
      }
    };

    // // Emit changesocket once when the component mounts
    validateToken(auth).then(() => {
      console.log("validated token: ", auth.user);
      emitChangeSocket();
    });

    return () => {
      socket.off("queue found", handleQueueFound);
    };
  }, [auth]);

  return <>{children}</>;
};

export default SocketRefresh;
