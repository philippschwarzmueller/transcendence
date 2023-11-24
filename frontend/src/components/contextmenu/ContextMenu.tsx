import React, { useContext, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IUser } from "../../context/auth";
import { EChannelType, IChannel } from "../chatwindow/properties";
import { SocketContext } from "../../context/socket";

const StyledUl = styled.ul<{ $display: boolean; $posX: number; $posY: number }>`
  display: ${(props) => (props.$display ? "" : "none")};
  position: absolute;
  z-index: 600;
  left: ${(props) => props.$posX + "px"};
  top: ${(props) => props.$posY + "px"};
  list-style-type: none;
  background-color: rgb(195, 199, 203);
  min-width: 100px;
  margin-block-start: 0px;
  margin-inline-start: 0px;
  padding-inline-start: 0px;
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 1px 0px 1px;
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
  isFriendIncoming: boolean;
  isPendingFriendIncoming: boolean;
  triggerReload: () => void;
}

const ContextMenu: React.FC<IContextMenu> = ({
  display,
  positionX,
  positionY,
  link,
  isFriendIncoming,
  isPendingFriendIncoming,
  triggerReload,
}) => {
  const [isFriend, setIsFriend] = useState<boolean>(isFriendIncoming);
  const [isPendingFriend, setIsPendingFriend] = useState<boolean>(
    isPendingFriendIncoming,
  );
  const auth = useContext(AuthContext).user;
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const startChat = () => {
    const body: IChannel = {
      user: auth,
      type: EChannelType.CHAT,
      id: 0,
      title: link,
    };
    socket.emit("create", body);
    navigate("/chat");
  };

  const handleFriendAccept = async (
    friend: string | undefined,
    isPendingFriend: boolean | undefined,
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
          setIsPendingFriend(false);
          triggerReload();
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    }
  };

  const handleFriendRemove = async (
    friend: string | undefined,
    isFriend: boolean,
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
          setIsFriend(false);
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
        {isPendingFriend && (
          <OptionLi onClick={() => handleFriendAccept(link, isPendingFriend)}>
            👥 Accept friend request
          </OptionLi>
        )}
        {isPendingFriend && <LineLi />}
        {link !== undefined && (
          <Link to={`/profile/${link}`}>
            <OptionLi>👤 Visit Profile</OptionLi>
          </Link>
        )}
        <LineLi />
        <OptionLi>🏓 Challenge to Game</OptionLi>
        <LineLi />
        <OptionLi onClick={() => startChat()}>💬 Start Chat</OptionLi>
        <LineLi />
        {isFriend && (
          <OptionLi onClick={() => handleFriendRemove(link, isFriend)}>
            ❌ Remove friend
          </OptionLi>
        )}
        {isFriend && <LineLi />}
        <OptionLi>🚫 Block User</OptionLi>
        <LineLi />
      </StyledUl>
    </>
  );
};

export default ContextMenu;
