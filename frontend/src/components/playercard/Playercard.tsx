import React, { useState } from "react";
import styled from "styled-components";
import { IUser } from "../../context/auth";
import Avatar from "../avatar";
import ContextMenu from "../contextmenu/ContextMenu";

const StyledDiv = styled.div`
  text-align: center;
  min-width: 7rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  background-color: rgb(195, 199, 203);
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
  padding: 8px;
  cursor: pointer;
  &:active {
    outline: 1px dotted rgb(0, 0, 0);
    outline-offset: -5px;
    box-shadow: inset 0 0 0 1px rgb(134, 138, 142), 0 0 0 1px rgb(0, 0, 0);
  }
`;
interface PlayerCardProps {
  user: IUser;
  triggerReload?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ user, triggerReload }) => {
  let [showContext, setShowContext] = useState<boolean>(false);
  let [x, setX] = useState<number>(0);
  let [y, setY] = useState<number>(0);

  function openContextMenu(e: React.MouseEvent) {
    setX(e.pageX - e.clientX);
    setY(e.pageY - e.clientY);
    setShowContext(!showContext);
  }

  return (
    <>
      <ContextMenu
        display={showContext}
        positionX={x}
        positionY={y}
        user={user}
        triggerReload={triggerReload}
      />
      <div onClick={(e) => openContextMenu(e)}>
      <StyledDiv onClick={(e) => openContextMenu(e)}>
        <Avatar
          name={user.name}
          src={
            user.hasCustomAvatar ? user.customAvatar : user.profilePictureUrl
          }
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <p style={{ margin: "3px", fontWeight: "800" }}>{user.name}</p>
          <p style={{ margin: "3px" }}>W/L%: 40</p>
        </div>
      </StyledDiv>
      </div>
    </>
  );
};

export default PlayerCard;
