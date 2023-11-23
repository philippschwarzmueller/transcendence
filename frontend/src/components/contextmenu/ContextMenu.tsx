import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IAuthContext } from "../../context/auth";

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
  name: string | undefined;
  triggerReload: () => void;
}

export enum FriendState {
  noFriend,
  pendingFriend,
  friend,
}

const ContextMenu: React.FC<IContextMenu> = ({
  display,
  positionX,
  positionY,
  name,
  triggerReload,
}) => {
  const [friendState, setFriendState] = useState<FriendState>(
    FriendState.noFriend
  );
  const [ownProfile, setOwnProfile] = useState<boolean>(false);
  let [isLoading, setIsLoading] = useState<boolean>(true);
  const auth: IAuthContext = useContext(AuthContext);
  const [, setRefreshFlag] = useState(false);
  const handleFriendAccept = async (friend: string | undefined) => {
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
          setFriendState(FriendState.friend);
          triggerReload();
          refreshContextMenu();
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    }
  };

  const handleFriendRemove = async (friend: string | undefined) => {
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
          setFriendState(FriendState.noFriend);
          triggerReload();
          refreshContextMenu();
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    }
  };

  const handleFriendAdd = async (friend: string | undefined) => {
    if (friend !== undefined) {
      try {
        const res = await fetch(`${BACKEND}/users/send-friend-request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friend }),
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const success: boolean = await res.json();
        if (success) {
          setFriendState(FriendState.pendingFriend);
          triggerReload();
          refreshContextMenu();
        }
      } catch (error) {
        console.error("Error sending friend request", error);
      }
    }
  };

  const fetchFriendData = async () => {
    try {
      const res: Response = await fetch(`${BACKEND}/users/get-friend-state`, {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const friendState: FriendState = await res.json();
      if (friendState === FriendState.friend) {
        setFriendState(FriendState.friend);
      }
      if (friendState === FriendState.pendingFriend) {
        setFriendState(FriendState.pendingFriend);
      }
      if (auth.user.name === name) {
        setOwnProfile(true);
      }
    } catch (error) {
      console.error("Error fetching pendingFriendRequests:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchFriendData();
      setIsLoading(false);
    };
    fetchData();
  }, [friendState]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshContextMenu = () => {
    setRefreshFlag((prev) => !prev);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <StyledUl $display={display} $posX={positionX} $posY={positionY}>
        {friendState === FriendState.pendingFriend && (
          <OptionLi onClick={() => handleFriendAccept(name)}>
            👥 Accept friend request
          </OptionLi>
        )}
        {friendState === FriendState.pendingFriend && <LineLi />}
        {friendState === FriendState.noFriend && !ownProfile && (
          <OptionLi onClick={() => handleFriendAdd(name)}>
            👨‍❤️‍💋‍👨 Add as friend
          </OptionLi>
        )}
        {friendState === FriendState.noFriend && <LineLi />}
        {name !== undefined && (
          <Link to={`/profile/${name}`}>
            <OptionLi>👤 Visit Profile</OptionLi>
          </Link>
        )}
        <LineLi />
        {!ownProfile && <OptionLi>🏓 Challenge to Game</OptionLi>}
        {!ownProfile && <LineLi />}
        {!ownProfile && <OptionLi>💬 Start Chat</OptionLi>}
        {!ownProfile && <LineLi />}
        {friendState === FriendState.friend && (
          <OptionLi onClick={() => handleFriendRemove(name)}>
            ❌ Remove friend
          </OptionLi>
        )}
        {friendState === FriendState.friend && <LineLi />}
        {!ownProfile && <OptionLi>🚫 Block User</OptionLi>}
        {!ownProfile && <LineLi />}
      </StyledUl>
    </>
  );
};

export default ContextMenu;
