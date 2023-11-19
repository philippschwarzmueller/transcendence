import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BACKEND } from "../../routes/SetUser";

const Win98Box = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(195, 199, 203);
  box-shadow: inset 1px 1px 0px 1px rgb(255, 255, 255),
    inset 0 0 0 1px rgb(134, 138, 142), 1px 1px 0px 1px rgb(0, 0, 0),
    2px 2px 5px 0px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  max-height: fit-content;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  gap: 20px;
`;

const Title = styled.div`
  background-color: #5a7b8c;
  color: white;
  padding: 10px;
  font-weight: bold;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  width: 102%;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
  margin-bottom: 10px;
  margin-top: -13px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StatLabel = styled.span`
  color: #000080;
  font-weight: bold;
`;

const StatValue = styled.span`
  color: #808080;
`;

const StyledStatsWindow = styled(Win98Box)`
  max-width: 300px;
`;

interface StatsWindowProps {
  intraname: string;
}

const StatsWindow: React.FC<StatsWindowProps> = ({ intraname }) => {
  const [wonGames, setWonGames] = useState<number>(0);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [elo, setElo] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseWon = await fetch(
          `${BACKEND}/games/getwongamesamount/${intraname}`
        );
        const responseTotal = await fetch(
          `${BACKEND}/games/gettotalgamesamount/${intraname}`
        );
        const responseElo = await fetch(`${BACKEND}/games/getelo/${intraname}`);

        const won = await responseWon.json();
        const total = await responseTotal.json();
        const playerElo = await responseElo.json();

        setWonGames(won);
        setTotalGames(total);
        setElo(playerElo);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [intraname]);

  const winRate =
    totalGames > 0 ? ((wonGames / totalGames) * 100).toFixed(2) : 0;

  return (
    <StyledStatsWindow>
      <ContentContainer>
        <Title>{intraname}'s Stats</Title>
        <StatItem>
          <StatLabel>Won:</StatLabel>
          <StatValue>{wonGames}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Win Rate:</StatLabel>
          <StatValue>{winRate}%</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Total Games:</StatLabel>
          <StatValue>{totalGames}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Elo:</StatLabel>
          <StatValue>{elo}</StatValue>
        </StatItem>
      </ContentContainer>
    </StyledStatsWindow>
  );
};

export default StatsWindow;
