import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import GlobalStyle from "./GlobalStyle";
import { AuthContext, IUser } from "../context/auth";
import { SocketContext, awSocket } from "../context/socket";
import RefreshProvider from "../components/refresh/RefreshProvider";
import { IProfile, ProfileContext } from "../context/profile";
import { QueueProvider } from "../context/queue";
import { Socket } from "socket.io-client";

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
  const [profile, setProfile] = React.useState<IProfile>({
      intraname: "",
      name: "",
      profilePictureUrl: "",
      display: false,
    });
  const updateProfile = (profile: IUser, value: boolean) => {
      setProfile({
          intraname: profile.intraname,
          name: profile.name,
          profilePictureUrl: profile.profilePictureUrl,
          display: value,
        })
    }
  const socket: Socket = useContext(SocketContext);
  socket.on("connect", () => {
    socket.emit("contact", { user: user, type: 0, id: 0, title: "" });
  });
  socket.on("disconnect", () => {
    socket.emit("layoff", user.name);
  });
  return (
    <>
      <AuthContext.Provider value={{ user, logIn, logOut }}>
        <ProfileContext.Provider
          value={{
            profile,
            updateProfile
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
