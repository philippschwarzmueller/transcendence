import React from "react";

import GameWindow from "../components/gamewindow/";

const Game: React.FC = () => {
  return (
    <>
      <h1>This is the title</h1>
      <div>
        <GameWindow></GameWindow>
      </div>
    </>
  );
};

export default Game;
