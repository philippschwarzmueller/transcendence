import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";
import { AuthContext, IUser } from "../context/auth";
import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import { CookiesProvider } from "react-cookie";

const chatSocket = io(`http://${window.location.hostname}:${8080}`);

const ChatSocketContext = createContext<Socket>(chatSocket);

const Root: React.FC = () => {
  const [user, setUser] = React.useState<IUser>({
    id: undefined,
    name: undefined,
    image: undefined,
    token: undefined,
  });
  const logIn = (user: IUser) => {
    setUser(user);
  };
  const logOut = () => {
    setUser({
      id: undefined,
      name: undefined,
      image: undefined,
      token: undefined,
    });
  };
  return (
    <>
      <CookiesProvider>
        <AuthContext.Provider value={{ user, logIn, logOut }}>
          <ChatSocketContext.Provider value={chatSocket}>
            <GlobalStyle />
            <Nav />
            <Outlet />
          </ChatSocketContext.Provider>
        </AuthContext.Provider>
      </CookiesProvider>
    </>
  );
};

export default Root;
export { ChatSocketContext };
