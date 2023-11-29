import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IUser, IAuthContext } from "../../context/auth";
import { EChannelType, IChannel } from "../chatwindow/properties";
import { SocketContext } from "../../context/socket";
import { ProfileContext } from "../../context/profile";

const StyledUl = styled.ul<{ $display: boolean }>`
  display: ${(props) => (props.$display ? "" : "none")};
  position: absolute;
  z-index: 200;
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
  user: IUser;
  triggerReload?: () => void;
}

export enum FriendState {
  noFriend,
  requestedFriend,
  pendingFriend,
  friend,
}

const ContextMenu: React.FC<IContextMenu> = ({
  display,
  user,
  triggerReload,
}) => {

  const profile = useContext(ProfileContext)
  const [friendState, setFriendState] = useState<FriendState>(
    FriendState.noFriend,
  );
  let [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = useContext(AuthContext);
  const [ownProfile, setOwnProfile] = useState<boolean>(false);
  const [, setRefreshFlag] = useState(false);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const startChat = () => {
    const body: IChannel = {
      user: auth.user,
      type: EChannelType.CHAT,
      id: 0,
      title: user.name,
    };
    socket.emit("create", body);
    navigate("/chat");
  };

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
          if (triggerReload) triggerReload();
          refreshContextMenu();
        } else {
          alert("An Error occured, please reload the page to update data");
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
          if (triggerReload) triggerReload();
          refreshContextMenu();
        } else {
          alert("An Error occured, please reload the page to update data");
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
          if (triggerReload) triggerReload();
          refreshContextMenu();
        } else {
          alert("An Error occured, please reload the page to update data");
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
        body: JSON.stringify( {name: user.name} ),
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const friendState: FriendState = await res.json();
      setFriendState(friendState);
      if (auth.user.name === user.name) {
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
    return <div></div>;
  }

  return (
    <>
      <StyledUl $display={display}>
        {/* PENDING FRIEND */}
        {friendState === FriendState.pendingFriend && (
          <OptionLi onClick={() => handleFriendAccept(user.name)}>
            👥 Accept friend request
          </OptionLi>
        )}
        {friendState === FriendState.pendingFriend && <LineLi />}
        {/* NO FRIEND */}
        {friendState === FriendState.noFriend && !ownProfile && (
          <OptionLi onClick={() => handleFriendAdd(user.name)}>
            👨‍❤️‍💋‍👨 Add as friend
          </OptionLi>
        )}
        {friendState === FriendState.noFriend && <LineLi />}
        {/* REQUESTED FRIEND */}
        {friendState === FriendState.requestedFriend && !ownProfile && (
          <OptionLi>👀 Friend request pending</OptionLi>
        )}
        {friendState === FriendState.requestedFriend && <LineLi />}
        {user.name !== undefined && (
          <OptionLi onClick={() => {
            profile.name = user.name ? user.name : ""
            profile.intraname = user.intraname ? user.intraname : ""
            profile.profilePictureUrl = user.profilePictureUrl ? user.profilePictureUrl: ""
            profile.display = true
          }}>👤 Visit Profile</OptionLi>
        )}
        <LineLi />
        {!ownProfile && <OptionLi>🏓 Challenge to Game</OptionLi>}
        {!ownProfile && <LineLi />}
        {!ownProfile && (
          <OptionLi onClick={() => startChat()}>💬 Start Chat</OptionLi>
        )}
        {!ownProfile && <LineLi />}
        {/* FRIEND */}
        {friendState === FriendState.friend && (
          <OptionLi onClick={() => handleFriendRemove(user.name)}>
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
