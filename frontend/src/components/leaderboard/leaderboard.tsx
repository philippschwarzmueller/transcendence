import React, { useEffect, useState } from "react";
import { BACKEND } from "../../routes/SetUser";
import Dropdown from "../dropdown/dropdown";
import Checkbox from "../checkbox/checkbox";
import styled from "styled-components";
import WindowWrapper from "../outlinecontainer/outlinecontainer";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Moveablewindow from "../moveablewindow";

const HorizontalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

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

const StyledTableContainer = styled.div`
  max-height: 150px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 17x;
    height: 17px;
  }
  &::-webkit-scrollbar-track {
    margin-top: 6px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    box-sizing: border-box;
    display: inline-block;
    background: rgb(195, 199, 203);
    color: rgb(0, 0, 0);
    border: 0px;
    box-shadow:
      rgb(0, 0, 0) -1px -1px 0px 0px inset,
      rgb(210, 210, 210) 1px 1px 0px 0px inset,
      rgb(134, 138, 142) -2px -2px 0px 0px inset,
      rgb(255, 255, 255) 2px 2px 0px 0px inset;
  }
`;

const StyledTable = styled.table`
  text-align: center;
  width: 600px;
  table-layout: fixed;
  border-collapse: collapse;
`;

const StyledTableHead = styled.thead`
  position: sticky;
  border: 5px solid #00000000;
  top: 4px;
  background-color: white;
`;

const StyledTableBody = styled.tbody``;

const Leaderboard: React.FC<{ $display: boolean, z?: number}> = ({
  $display,
  z
}) => {
  const [data, setData] = useState<ILeaderboardLine[]>([]);
  const [gamemode, setGamemode] = useState<string>("0");
  const [sortedBy, setSortedBy] = useState<ESortedBy>(ESortedBy.Elo);
  const [checkedStandardBox, setCheckedStandardBox] = useState<boolean>(true);
  const [checked2dBox, setChecked2dBox] = useState<boolean>(true);
  const navigate: NavigateFunction = useNavigate();

  const handleElementClick = (intraname: string): void => {
    navigate(`/profile/${intraname}`);
  };

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
  }, [sortedBy, gamemode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (checkedStandardBox && checked2dBox) setGamemode("0");
    else if (checkedStandardBox && !checked2dBox) setGamemode("1");
    else if (!checkedStandardBox && checked2dBox) setGamemode("2");
    else setGamemode("3");
  }, [checkedStandardBox, checked2dBox]);

  return (
    <>
      <Moveablewindow
        title="Leaderboard"
        positionZ={z}
        display={$display}
      >
        <WindowWrapper title="sortBy" titlebottom="35px">
          <HorizontalContainer>
            <p></p>
            <Checkbox
              label="Standard Pong"
              checked={checkedStandardBox}
              onChange={() => {
                setCheckedStandardBox(!checkedStandardBox);
              }}
            />
            <Checkbox
              label="2D Pong"
              checked={checked2dBox}
              onChange={() => {
                setChecked2dBox(!checked2dBox);
              }}
            />
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
          </HorizontalContainer>
        </WindowWrapper>
        <p></p>
        <StyledTableContainer>
          <StyledTable>
            <StyledTableHead>
              <tr>
                <th>Rank</th>
                <th>Nickname</th>
                <th>Elo</th>
                <th>WonGames</th>
                <th>Winrate</th>
                <th>TotalGames</th>
              </tr>
            </StyledTableHead>
            <StyledTableBody>
              {data.map((val, key) => (
                <tr
                  onClick={() => {
                    handleElementClick(val.intraname);
                  }}
                  key={key}
                >
                  <td>{val.rank}</td>
                  <td>{val.nickname}</td>
                  <td>{val.elo}</td>
                  <td>{val.wonGames}</td>
                  <td>{val.winrate.toFixed(2)}%</td>
                  <td>{val.totalGames}</td>
                </tr>
              ))}
            </StyledTableBody>
          </StyledTable>
        </StyledTableContainer>
      </Moveablewindow>
    </>
  );
};

export default Leaderboard;
