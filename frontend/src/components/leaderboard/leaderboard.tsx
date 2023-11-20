import React, { useEffect, useState } from "react";
import { BACKEND } from "../../routes/SetUser";
import { Win98Box } from "../matchhistory/Matchhistory";

interface ILeaderboardLine {
  intraname: string;
  nickname: string;
  elo: number;
  wonGames: number;
  winrate: number;
  totalGames: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<ILeaderboardLine[]>([]);
  const [gamemode, setGamemode] = useState<string>("0");
  useEffect(() => {
    fetch(`${BACKEND}/leaderboard/data/${gamemode}`)
      .then((res) => {
        return res.json();
      })
      .then(setData)
      .catch(console.error);
  }, [gamemode]);

  return (
    <>
      {/* <Win98Box> */}
      <h1>Leaderboard</h1>
      <h2>enter boxes + sorting here</h2>
      <table>
        <tr>
          <th>Rank</th>
          <th>Nickname</th>
          <th>Elo</th>
          <th>WonGames</th>
          <th>Winrate</th>
          <th>TotalGames</th>
        </tr>
        {data.map((val, key) => {
          return (
            <tr key={key}>
              <td>{val.rank}</td>
              <td>{val.nickname}</td>
              <td>{val.elo}</td>
              <td>{val.wonGames}</td>
              <td>{val.winrate.toFixed(2)}%</td>
              <td>{val.totalGames}</td>
            </tr>
          );
        })}
      </table>
      {/* </Win98Box> */}
    </>
  );
};

export default Leaderboard;
