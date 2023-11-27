import React, { useContext } from "react";
import Pagetitle from "../components/pagetitle/";
import { AuthContext } from "../context/auth";
import MatchHistory from "../components/matchhistory/Matchhistory";
import StatsWindow from "../components/stats/StatsWindow";
import GraphComponent from "../components/elograph/elograph";
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
        {auth?.user?.intraname ? (
          <>
            <StatsWindow intraname={auth.user.intraname}></StatsWindow>
            <MatchHistory intraname={auth.user.intraname}></MatchHistory>
            <GraphComponent intraname={auth.user.intraname}></GraphComponent>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Home;
