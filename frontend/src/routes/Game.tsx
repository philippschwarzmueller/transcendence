import React, { useEffect, useState } from "react";
import Pagetitle from "../components/pagetitle/Pagetitle";

import GameWindow from "../components/gamewindow/";
import { useParams } from "react-router-dom";
import { BACKEND } from "./SetUser";

const fetchPlayers = async (gameId: string | undefined): Promise<string> => {
  const res = await fetch(`${BACKEND}/games/players/${gameId}`);
  if (!res.ok) throw new Error("Failed to fetch players");
  const players: string[] = await res.json();
  return `${players[0]} vs ${players[1]}`;
};

const Game: React.FC = () => {
  const params = useParams();
  const [gameTitle, setGameTitle] = useState<string>("vs");

  useEffect(() => {
    fetchPlayers(params.gameId)
      .then(setGameTitle)
      .catch(() => {
        setGameTitle("vs");
      });
  }, [params.gameId]);
  return (
    <>
      <Pagetitle>{gameTitle}</Pagetitle>
      <GameWindow></GameWindow>
    </>
  );
};

export default Game;
