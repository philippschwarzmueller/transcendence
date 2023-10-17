import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";
import { createContext } from "react";
import { io, Socket } from "socket.io-client";
import { CookiesProvider } from "react-cookie";

const chatSocket = io(`http://${window.location.hostname}:${8080}`);

const ChatSocketContext = createContext<Socket>(chatSocket);

const Root: React.FC = () => {
  return (
    <>
      <CookiesProvider defaultSetOptions={{ path: "/" }}>
        <ChatSocketContext.Provider value={chatSocket}>
          <GlobalStyle />
          <Nav />
          <Outlet />
        </ChatSocketContext.Provider>
      </CookiesProvider>
    </>
  );
};

export default Root;
export { ChatSocketContext };
