import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { IGameStart, IGameUser } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";
import { AuthContext, IAuthContext, IUser } from "../../context/auth";
import { validateToken } from "../../routes/PrivateRoute";

interface LoginRefreshProps {
  children: JSX.Element;
}

const LoginRefresh: React.FC<LoginRefreshProps> = ({ children }) => {
  const auth: IAuthContext = useContext(AuthContext);

  useEffect(() => {
    validateToken(auth);
  }, [auth]);

  return <>{children}</>;
};

export default LoginRefresh;
