import React from "react";
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
