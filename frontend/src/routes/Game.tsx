import React from "react";

import GameWindow from "../components/gamewindow/";

const Game: React.FC = () => {
  return (
    <>
      <h1>This is the title</h1>
      <div>
        <GameWindow width={20} height={100}></GameWindow>
      </div>
    </>
  );
};

export default Game;
