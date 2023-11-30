import React from "react";
import { Outlet } from "react-router-dom";
import GlobalStyle from "./GlobalStyle";
import { AuthContext, IUser } from "../context/auth";
import { SocketContext, awSocket } from "../context/socket";
import RefreshProvider from "../components/refresh/RefreshProvider";
import { ProfileContext } from "../context/profile";
import { QueueProvider } from "../context/queue";

const Root: React.FC = () => {
  const [user, setUser] = React.useState<IUser>({
    id: undefined,
    name: undefined,
    intraname: undefined,
    twoFAenabled: false,
    profilePictureUrl: undefined,
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
      profilePictureUrl: undefined,
      token: undefined,
      activeChats: [],
    });
  };

  return (
    <>
      <AuthContext.Provider value={{ user, logIn, logOut }}>
        <ProfileContext.Provider
          value={{
            intraname: "",
            name: "",
            profilePictureUrl: "",
            display: false,
          }}
        >
          <QueueProvider>
            <SocketContext.Provider value={awSocket}>
              <RefreshProvider>
                <GlobalStyle />
                <Outlet />
              </RefreshProvider>
            </SocketContext.Provider>
          </QueueProvider>
        </ProfileContext.Provider>
      </AuthContext.Provider>
    </>
  );
};

export default Root;
