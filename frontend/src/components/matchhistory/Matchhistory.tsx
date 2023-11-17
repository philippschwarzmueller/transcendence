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

const Container = styled.div`
  position: relative;
  text-align: center;
  width: 100%;
  max-width: 400px;
  max-height: 500px;
  margin: auto;
  overflow: hidden; /* Hide the main container overflow */
`;

const Win98Box = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(195, 199, 203);
  box-shadow: inset 1px 1px 0px 1px rgb(255, 255, 255),
    inset 0 0 0 1px rgb(134, 138, 142), 1px 1px 0px 1px rgb(0, 0, 0),
    2px 2px 5px 0px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  height: 100%; /* Set height to 100% of the parent container */
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%; /* Set height to 100% of the parent container */
`;

const TitleContainer = styled.div`
  margin-bottom: 10px; /* Adjust the margin to create space below the title */
`;

const Title = styled.div`
  background-color: #5a7b8c;
  color: white;
  padding: 5px;
  font-weight: bold;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  width: 96.5%; /* Add 12px to accommodate scrollbar */
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
`;

const MatchListContainer = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 8px; /* Add padding to create space between content and edges */
  box-sizing: border-box; /* Include padding in the element's total width and height */
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
    <Container>
      <Win98Box>
        <ContentContainer>
          <TitleContainer>
            <Title>Match History</Title>
          </TitleContainer>
          <MatchListContainer>
            <MatchList>
              {matches.slice(0, 10).map((match, index) => (
                <MatchItem
                  key={index}
                  won={match.wonGame}
                  onClick={() => handleMatchClick(match.enemyIntra)}
                >
                  <MatchDetails>
                    <MatchStatus won={match.wonGame}>
                      {match.wonGame ? "🏆" : "😞"}
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
          </MatchListContainer>
        </ContentContainer>
      </Win98Box>
    </Container>
  );
};

export default MatchHistory;
