import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/nav";
import GlobalStyle from "./GlobalStyle";
import { AuthContext, IUser } from "../context/auth";

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
      <AuthContext.Provider value={{ user, logIn, logOut }}>
        <GlobalStyle />
        <Nav />
        <Outlet />
      </AuthContext.Provider>
    </>
  );
};

export default Root;
