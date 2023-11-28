import React, { useContext } from "react";
import Pagetitle from "../components/pagetitle/";
import { AuthContext } from "../context/auth";
import Taskbar from "../components/taskbar/Taskbar";

const Home: React.FC = () => {
  const auth = useContext(AuthContext);

  return (
    <>
      <Taskbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "95vh",
        }}
      >
        <Pagetitle>Welcome to WinPong, {auth.user.name}</Pagetitle>
      </div>
    </>
  );
};

export default Home;
