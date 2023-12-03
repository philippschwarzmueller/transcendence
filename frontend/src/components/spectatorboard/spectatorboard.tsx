import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { BACKEND } from "../../routes/SetUser";
import Moveablewindow from "../moveablewindow";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth";

const Wrapper = styled.div`
  width: 400px;
  height: 400px;
  overflow-y: auto;
`;

interface SpectatorboardProps {
  intraname?: string;
  display: boolean;
  z: number;
  setDisplay?: (display: boolean) => void;
}

interface ISpectateGame {
  gameId: string;
  leftPlayerNickname: string;
  leftPlayerIntraname: string;
  leftPlayerPoints: number;
  rightPlayerNickname: string;
  rightPlayerIntraname: string;
  rightPlayerPoints: number;
}

const StyledItem = styled.li`
  margin: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0px;
  background-color: rgb(195, 199, 203);
  box-shadow:
    inset 1px 1px 0px 1px rgb(255, 255, 255),
    inset 0 0 0 1px rgb(134, 138, 142),
    1px 1px 0px 1px rgb(0, 0, 0),
    2px 2px 5px 0px rgba(0, 0, 0, 0.5);

  &:hover {
    outline-offset: -5px;
    box-shadow:
      inset 1px 1px 0px 1px rgb(255, 255, 255),
      inset 0 0 0 1px rgb(134, 138, 142),
      1px 1px 0 0px rgb(0, 0, 0);
  }
`;

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledParagraph = styled.p`
  font-size: large;
`;

const getGameUrl = (
  selfIntraname: string | null | undefined,
  spectateGame: ISpectateGame,
): string => {
  if (!selfIntraname) return `/play/${spectateGame.gameId}`;
  else if (selfIntraname === spectateGame.leftPlayerIntraname)
    return `/play/${spectateGame.gameId}/left`;
  else if (selfIntraname === spectateGame.rightPlayerIntraname)
    return `/play/${spectateGame.gameId}/right`;
  else return `/play/${spectateGame.gameId}`;
};

const Spectatorboard: React.FC<SpectatorboardProps> = (
  props: SpectatorboardProps,
) => {
  const [spectateGames, setSpectateGames] = useState<ISpectateGame[]>([]);
  const navigate: NavigateFunction = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (props.intraname) {
      fetch(`${BACKEND}/games/runninggames/${props.intraname}`)
        .then((res) => res.json())
        .then((data: ISpectateGame[]) => {
          setSpectateGames(data);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      fetch(`${BACKEND}/games/runninggames`)
        .then((res) => res.json())
        .then((data: ISpectateGame[]) => {
          setSpectateGames(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [props.intraname, props.display]);

  return (
    <>
      <Moveablewindow
        title="Running Games"
        display={props.display}
        positionZ={props.z}
        setDisplay={props.setDisplay}
      >
        <Wrapper>
          {spectateGames.length > 0 ? (
            <StyledList>
              {spectateGames.map((game, key) => (
                <StyledItem
                  key={key}
                  onClick={() => {
                    navigate(getGameUrl(auth?.user?.intraname, game));
                  }}
                >
                  <>
                    <StyledParagraph>
                      {game.leftPlayerNickname} vs {game.rightPlayerNickname}
                    </StyledParagraph>
                    <StyledParagraph>
                      {game.leftPlayerPoints} - {game.rightPlayerPoints}
                    </StyledParagraph>
                  </>
                </StyledItem>
              ))}
            </StyledList>
          ) : (
            <p>There are no games running currently</p>
          )}
        </Wrapper>
      </Moveablewindow>
    </>
  );
};

export default Spectatorboard;
