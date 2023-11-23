import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BACKEND } from "../../routes/SetUser";
import Moveablewindow from "../moveablewindow";

const Wrapper = styled.div`
  width: 400px;
  height: 400px;
  border: 2px solid black;
`;

interface SpectatorboardProps {
  intraname?: string;
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
  box-shadow: 1px 1px 0px inset white, 1px 1px 0px white;
  border: 1px solid #808080;
  margin: 10px;
  align-items: center;
`;

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Spectatorboard: React.FC<SpectatorboardProps> = (
  props: SpectatorboardProps
) => {
  const [spectateGames, setSpectateGames] = useState<ISpectateGame[]>([]);

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
  }, [props.intraname]);

  return (
    <>
      <Moveablewindow>
        <Wrapper>
          <StyledList>
            {spectateGames.map((game, key) => (
              <StyledItem
                key={key}
                onClick={() => {
                  console.log(game);
                }}
              >
                <>
                  <p>
                    {game.leftPlayerNickname} vs {game.rightPlayerNickname}
                  </p>
                  <p>
                    {game.leftPlayerPoints} - {game.rightPlayerPoints}
                  </p>
                </>
              </StyledItem>
            ))}
          </StyledList>
        </Wrapper>
      </Moveablewindow>
    </>
  );
};

export default Spectatorboard;
