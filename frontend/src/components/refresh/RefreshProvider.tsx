import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SocketContext } from "../../context/socket";
import { Socket } from "socket.io-client";
import { IGameStart, IGameUser } from "../gamewindow/properties";
import { useNavigate } from "react-router-dom";
import { AuthContext, IUser } from "../../context/auth";
import LoginRefresh from "./LoginRefresh";
import SocketRefresh from "./SocketRefresh";

interface RefreshProviderProps {
  children: JSX.Element[];
}

const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  return (
    <>
      <LoginRefresh>
        <SocketRefresh>{children}</SocketRefresh>
      </LoginRefresh>
    </>
  );
};

export default RefreshProvider;
