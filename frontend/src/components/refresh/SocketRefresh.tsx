import React, { useContext, useEffect } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { IGameStart } from "../gamewindow/properties";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContext, IAuthContext } from "../../context/auth";
import { validateToken } from "../../routes/PrivateRoute";

interface RefreshProviderProps {
  children: JSX.Element[];
}

export interface IChangeSocketPayload {
  intraname: string;
}

const SocketRefresh: React.FC<RefreshProviderProps> = ({ children }) => {
  const [, , removeCookie] = useCookies(["queue"]);
  const socket: Socket = useContext(SocketContext);
  const navigate: NavigateFunction = useNavigate();
  const auth: IAuthContext = useContext(AuthContext);

  useEffect(() => {
    socket.on("queue found", (body: IGameStart) => {
      removeCookie("queue");
      navigate(`/play/${body.gameId}/${body.side}`);
    });

    const emitChangeSocket = (): void => {
      if (auth.user.intraname) {
        const payload: IChangeSocketPayload = {
          intraname: auth.user.intraname,
        };
        socket.emit("changesocket", payload);
      }
    };

    validateToken(auth).then(() => {
      emitChangeSocket();
    });

    return () => {
      socket.off("queue found");
    };
  }, [auth, navigate, socket, removeCookie]);

  return <>{children}</>;
};

export default SocketRefresh;