import React, { useState } from "react";
import styled from "styled-components";
import Avatar from "../avatar";
import ContextMenu from "../contextmenu/ContextMenu";

const StyledDiv = styled.div`
  text-align: center;
  min-width: 7rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  background-color: rgb(195, 199, 203);
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
  padding: 8px;
  cursor: pointer;
  &:focus {
    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;

    box-shadow:
      inset 1px 1px 0px 1px rgb(255, 255, 255),
      inset 0 0 0 1px rgb(134, 138, 142),
      1px 1px 0 0px rgb(0, 0, 0);
  }

  &:active {
    padding: 8 20 4;

    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;

    box-shadow:
      inset 0 0 0 1px rgb(134, 138, 142),
      0 0 0 1px rgb(0, 0, 0);
  }
`;
interface PlayerCardProps {
  name: string | undefined;
  id: number | undefined;
  profilePictureUrl: string | undefined;
  triggerReload?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  profilePictureUrl,
  triggerReload,
}) => {
  let [showContext, setShowContext] = useState<boolean>(false);
  let [x, setX] = useState<number>(0);
  let [y, setY] = useState<number>(0);

  function openContextMenu(e: React.MouseEvent) {
    setX(e.pageX);
    setY(e.pageY);
    setShowContext(!showContext);
  }

  return (
    <>
      <StyledDiv onClick={(e) => openContextMenu(e)}>
        <Avatar name={name} src={profilePictureUrl} />
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <p style={{ margin: "3px", fontWeight: "800" }}>{name}</p>
          <p style={{ margin: "3px" }}>W/L%: 40</p>
        </div>
      </StyledDiv>
      <ContextMenu
        name = {name}
        display={showContext}
        positionX={x}
        positionY={y}
        triggerReload={triggerReload}
      />
    </>
  );
};

export default PlayerCard;
