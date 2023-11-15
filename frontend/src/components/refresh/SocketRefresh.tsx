import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";
import { AuthContext, IUser } from "../../context/auth";
import { validateToken } from "../../routes/PrivateRoute";

interface RefreshProviderProps {
  children: JSX.Element[];
}

export interface IChangeSocketPayload {
  intraname: string;
}

const SocketRefresh: React.FC<RefreshProviderProps> = ({ children }) => {
  const user: IUser = useContext(AuthContext).user;
  const [cookies, setCookie, removeCookie] = useCookies(["queue"]);
  const socket: Socket = useContext(SocketContext);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const handleQueueFound = (body: IGameStart) => {
      removeCookie("queue");
      navigate(`/play/${body.gameId}/${body.side}`);
      console.log("queue found");
    };
    socket.on("queue found", handleQueueFound);

    const emitChangeSocket = () => {
      if (user.intraname) {
        const payload: IChangeSocketPayload = { intraname: user.intraname };
        socket.emit("changesocket", payload);
      }
    };

    validateToken(auth).then(() => {
      emitChangeSocket();
    });

    return () => {
      socket.off("queue found", handleQueueFound);
    };
  }, [auth]);

  return <>{children}</>;
};

export default SocketRefresh;
