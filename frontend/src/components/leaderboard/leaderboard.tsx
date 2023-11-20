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
  const [checkedStandardBox, setCheckedStandardBox] = useState<boolean>(true);
  const [checked2dBox, setChecked2dBox] = useState<boolean>(true);

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

  useEffect(() => {
    if (checkedStandardBox && checked2dBox) setGamemode("0");
    else if (checkedStandardBox && !checked2dBox) setGamemode("1");
    else if (!checkedStandardBox && checked2dBox) setGamemode("2");
    else setGamemode("3");
  }, [checkedStandardBox, checked2dBox]);
  return (
    <>
      {/* <Win98Box> */}
      <h1>Leaderboard</h1>
      <div>
        <div>
          <p>standard</p>
          <input
            type="checkbox"
            checked={checkedStandardBox}
            onChange={() => {
              setCheckedStandardBox(!checkedStandardBox);
              console.log("checked standard box");
            }}
          />
        </div>
        <div>
          <p>2d</p>
          <input
            type="checkbox"
            title="2d"
            checked={checked2dBox}
            onChange={() => {
              setChecked2dBox(!checked2dBox);
              console.log("checked 2d box");
            }}
          />
        </div>
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
      </div>
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
