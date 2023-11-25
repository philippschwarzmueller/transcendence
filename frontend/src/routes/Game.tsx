import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";

import GameWindow from "../components/gamewindow/";
import Taskbar from "../components/taskbar/Taskbar";

const Game: React.FC = () => {
  return (
    <>
      <Pagetitle>Game</Pagetitle>
      <GameWindow></GameWindow>
      <Taskbar />
    </>
  );
};

export default Game;
