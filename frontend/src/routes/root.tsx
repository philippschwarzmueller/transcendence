import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";
import { createContext } from "react";

type AuthContextType = {
  loggedIn: boolean;
  setContext: React.Dispatch<React.SetStateAction<boolean>>;
};

const IUserContextState = {
  loggedIn: false,
  setContext: () => {},
};

export const AuthContext = createContext<AuthContextType>(IUserContextState);

const Root: React.FC = () => {
  const [loggedIn, setContext] = useState<boolean>(false);
  return (
    <>
      <AuthContext.Provider value={{ loggedIn, setContext }}>
        <GlobalStyle />
        <Nav />
        <Outlet />
      </AuthContext.Provider>
    </>
  );
};

export default Root;
