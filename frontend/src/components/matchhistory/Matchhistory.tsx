import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { BACKEND } from "../../routes/SetUser";

interface IMatch {
  winnerNickname: string;
  looserNickname: string;
  winnerPoints: number;
  looserPoints: number;
  wonGame: boolean;
  timestamp: Date;
  enemyIntra: string;
}

interface MatchHistoryProps {
  playerName: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ playerName }) => {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${BACKEND}/games/getallgames/${playerName}`
        );
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching match history:", error);
      }
    };

    fetchData();
  }, [playerName]);

  const handleMatchClick = (enemyIntra: string) => {
    navigate(`/profile/${enemyIntra}`);
  };

  return (
    <MatchHistoryContainer>
      <MatchList>
        {matches.slice(0, 10).map((match, index) => (
          <MatchItem
            key={index}
            won={match.wonGame}
            onClick={() => handleMatchClick(match.enemyIntra)}
          >
            <MatchDetails>
              <MatchStatus won={match.wonGame}>
                {match.wonGame ? "Won" : "Lost"}
              </MatchStatus>
              <MatchTimestamp>
                {new Date(match.timestamp).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </MatchTimestamp>
            </MatchDetails>
            <MatchPlayers>
              <MatchPlayer>{match.winnerNickname}</MatchPlayer>
              <VsSign>vs</VsSign>
              <MatchPlayer>{match.looserNickname}</MatchPlayer>
            </MatchPlayers>
            <MatchScores>
              <MatchScore>{match.winnerPoints}</MatchScore>
              <ScoreSeparator>-</ScoreSeparator>
              <MatchScore>{match.looserPoints}</MatchScore>
            </MatchScores>
          </MatchItem>
        ))}
      </MatchList>
    </MatchHistoryContainer>
  );
};

const MatchHistoryContainer = styled.div`
  text-align: center;
  width: 100%;
  max-width: 400px;
  margin: auto;
  overflow-y: auto;
  max-height: 440px;
  background-color: rgb(195, 199, 203);
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
  padding: 8px;
  border-radius: 5px;
`;

const MatchList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MatchItem = styled.li<{ won: boolean }>`
  background-color: ${(props) => (props.won ? "#a5d6a7" : "#ef9a9a")};
  margin-bottom: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border: 1px solid #000080;
  border-radius: 3px;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
`;

const MatchDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MatchStatus = styled.div<{ won: boolean }>`
  background-color: ${(props) => (props.won ? "#2e7d32" : "#c62828")};
  color: #ffffff;
  padding: 5px;
  border-radius: 3px;
  margin-bottom: 5px;
`;

const MatchTimestamp = styled.div`
  color: #808080;
`;

const MatchPlayers = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MatchPlayer = styled.div`
  color: #000080;
  font-weight: bold;
`;

const VsSign = styled.div`
  color: #808080;
  margin: 0 5px;
`;

const MatchScores = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const MatchScore = styled.div`
  color: #000080;
  font-weight: bold;
`;

const ScoreSeparator = styled.div`
  color: #808080;
`;

export default MatchHistory;
