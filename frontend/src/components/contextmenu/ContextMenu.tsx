import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { BACKEND } from "../../routes/SetUser";

const StyledUl = styled.ul<{ $display: boolean; $posX: number; $posY: number }>`
  display: ${(props) => (props.$display ? "" : "none")};
  position: absolute;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  list-style-type: none;
  background-color: rgb(195, 199, 203);
  min-width: 100px;
  margin-block-start: 0px;
  margin-inline-start: 0px;
  padding-inline-start: 0px;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 1px 0px 1px;
`;

const LineLi = styled.li`
  height: 1px;
  border-top: 1px solid rgb(134, 138, 142);
  width: 98%;
`;

const OptionLi = styled.li`
  padding-inline-start: 20px;
  padding-inline-end: 20px;
  font-size: 0.9rem;
  &:hover {
    background-color: rgb(0, 14, 122);
    color: rgb(255, 255, 255);
    cursor: pointer;
  }
`;

export interface IContextMenu {
  display: boolean;
  positionX: number;
  positionY: number;
  link: string | undefined;
  pendingFriend: boolean;
  isFriend: boolean;
  triggerReload: () => void;
}

const ContextMenu: React.FC<IContextMenu> = ({
  display,
  positionX,
  positionY,
  link,
  pendingFriend,
  isFriend,
  triggerReload,
}) => {
  const handleFriendAccept = async (
    friend: string | undefined,
    pendingFriend: boolean
  ) => {
    if (friend !== undefined) {
      try {
        const res = await fetch(`${BACKEND}/users/accept-friend-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ friend }),
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const success: boolean = await res.json();
        if (success) {
          pendingFriend = false;
          triggerReload();
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    }
  };

  const handleFriendRemove = async (
    friend: string | undefined,
    isfriend: boolean
  ) => {
    if (friend !== undefined) {
      try {
        const res = await fetch(`${BACKEND}/users/remove-friend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ friend }),
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const success: boolean = await res.json();
        if (success) {
          isfriend = false;
          triggerReload();
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    }
  };

  return (
    <>
      <StyledUl $display={display} $posX={positionX} $posY={positionY}>
        {pendingFriend && (
          <OptionLi onClick={() => handleFriendAccept(link, pendingFriend)}>
            👥 Accept friend request
          </OptionLi>
        )}
        {pendingFriend && <LineLi />}
        {isFriend && (
          <OptionLi onClick={() => handleFriendRemove(link, isFriend)}>
            ❌ Remove friend
          </OptionLi>
        )}
        {isFriend && <LineLi />}
        <OptionLi>🚫 Block User</OptionLi>
        <LineLi />
        <OptionLi>🏓 Challenge to Game</OptionLi>
        <LineLi />
        <OptionLi>💬 Start Chat</OptionLi>
        <LineLi />
        {link !== undefined && (
          <Link to={`/profile/${link}`}>
            <OptionLi>👤 Visit Profile</OptionLi>
          </Link>
        )}
      </StyledUl>
    </>
  );
};

export default ContextMenu;
