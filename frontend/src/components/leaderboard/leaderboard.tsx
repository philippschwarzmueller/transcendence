import React, { useEffect, useState } from "react";
import { BACKEND } from "../../routes/SetUser";
import { Win98Box } from "../matchhistory/Matchhistory";
import Dropdown from "../dropdown/dropdown";

interface ILeaderboardLine {
  intraname: string;
  nickname: string;
  elo: number;
  wonGames: number;
  winrate: number;
  totalGames: number;
  rank: number;
}

enum ESortedBy {
  Elo,
  WonGames,
  Winrate,
  TotalGames,
}

const sortData = (data: ILeaderboardLine[], sortedBy: ESortedBy): void => {
  switch (sortedBy) {
    case ESortedBy.Elo:
      data.sort((a, b) => b.elo - a.elo);
      break;
    case ESortedBy.WonGames:
      data.sort((a, b) => b.wonGames - a.wonGames);
      break;
    case ESortedBy.Winrate:
      data.sort((a, b) => b.winrate - a.winrate);
      break;
    case ESortedBy.TotalGames:
      data.sort((a, b) => b.totalGames - a.totalGames);
      break;
    default:
      break;
  }
};

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<ILeaderboardLine[]>([]);
  const [gamemode, setGamemode] = useState<string>("0");
  const [sortedBy, setSortedBy] = useState<ESortedBy>(ESortedBy.Elo);

  useEffect(() => {
    fetch(`${BACKEND}/leaderboard/data/${gamemode}`)
      .then((res) => {
        return res.json();
      })
      .then(setData)
      .catch(console.error);
  }, [gamemode]);

  useEffect(() => {
    const sortedData = [...data];
    sortData(sortedData, sortedBy);

    setData(sortedData);
  }, [sortedBy]);

  return (
    <>
      {/* <Win98Box> */}
      <h1>Leaderboard</h1>
      <h2>enter boxes + sorting here</h2>
      <Dropdown
        title="select sorting"
        items={[
          {
            label: "Elo",
            func: () => {
              setSortedBy(ESortedBy.Elo);
            },
          },
          {
            label: "WonGames",
            func: () => {
              setSortedBy(ESortedBy.WonGames);
            },
          },
          {
            label: "Winrate",
            func: () => {
              setSortedBy(ESortedBy.Winrate);
            },
          },
          {
            label: "TotalGames",
            func: () => {
              setSortedBy(ESortedBy.TotalGames);
            },
          },
        ]}
      ></Dropdown>
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
