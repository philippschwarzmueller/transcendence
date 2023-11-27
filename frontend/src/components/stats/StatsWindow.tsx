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
  const [winRate, setWinRate] = useState<number>(0);
  const [winrateDisplay, setWinrateDisplay] = useState<string>("0");

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
        const responseWinRate = await fetch(
          `${BACKEND}/games/getwinrate/${intraname}`
        );

        const won = await responseWon.json();
        const total = await responseTotal.json();
        const playerElo = await responseElo.json();
        const rate = await responseWinRate.json();

        setWonGames(won);
        setTotalGames(total);
        setElo(playerElo);
        setWinRate(rate);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (intraname)
      fetchData().then(() => {
        setWinrateDisplay(winRate.toFixed(2));
      });
  }, [intraname]);

  return (
    <StyledStatsWindow>
      <ContentContainer>
        <StatItem>
          <StatLabel>Won:</StatLabel>
          <StatValue>{wonGames}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Win Rate:</StatLabel>
          <StatValue>{winrateDisplay}%</StatValue>
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
