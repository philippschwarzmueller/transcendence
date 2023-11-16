import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";
import { AuthContext, IUser } from "../context/auth";
import { SocketContext, awSocket } from "../context/socket";

const Root: React.FC = () => {
  const [user, setUser] = React.useState<IUser>({
    id: undefined,
    name: undefined,
    intraname: undefined,
    twoFAenabled: false,
    image: undefined,
    token: undefined,
    activeChats: [],
  });
  const logIn = (user: IUser) => {
    setUser(user);
  };
  const logOut = () => {
    setUser({
      id: undefined,
      name: undefined,
      intraname: undefined,
      twoFAenabled: false,
      image: undefined,
      token: undefined,
      activeChats: [],
    });
  };
  return (
    <>
      <AuthContext.Provider value={{ user, logIn, logOut }}>
        <SocketContext.Provider value={awSocket}>
          <GlobalStyle />
          <Nav />
          <Outlet />
        </SocketContext.Provider>
      </AuthContext.Provider>
    </>
  );
};

export default Root;
