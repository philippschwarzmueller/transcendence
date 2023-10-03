import React from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";

import GameWindow from "../components/gamewindow/";

const Game: React.FC = () => {
  return (
    <>
      <Pagetitle>Game</Pagetitle>
      <GameWindow></GameWindow>
    </>
  );
};

export default Game;
