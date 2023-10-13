import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";
import { createContext } from "react";

interface IUser {
  id: number;
  name: string;
  image: string;
  token: string;
}

type AuthContextType = {
  loggedIn: IUser;
  setContext: React.Dispatch<React.SetStateAction<IUser>>;
};

const IUserContextState = {
  loggedIn: { id: 0, name: "", image: "", token: "" },
  setContext: () => {},
};

export const AuthContext = createContext<AuthContextType>(IUserContextState);

const Root: React.FC = () => {
  const [loggedIn, setContext] = useState<IUser>({
    // TODO check if this is best way to init or if it should rather be queried
    // from local/session storage token -> backend query
    id: 0,
    name: "",
    image: "",
    token: "",
  });
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
