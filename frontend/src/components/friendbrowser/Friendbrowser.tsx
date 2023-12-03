import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { IUser } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import Playercard from "../playercard";

const Browser = styled.div`
  width: 300px;
  height: 400px;
  padding: 10px;
  margin: 0px;
  overflow: auto;
  user-select: none;
  &::-webkit-scrollbar {
    width: 17x;
    height: 17px;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    box-sizing: border-box;
    display: inline-block;
    background: rgb(195, 199, 203);
    color: rgb(0, 0, 0);
    border: 0px;
    box-shadow:
      rgb(0, 0, 0) -1px -1px 0px 0px inset,
      rgb(210, 210, 210) 1px 1px 0px 0px inset,
      rgb(134, 138, 142) -2px -2px 0px 0px inset,
      rgb(255, 255, 255) 2px 2px 0px 0px inset;
  }
`;

const StyledUl = styled.ul`
  border: none;
  margin: 0px;
  padding: 2px;
  list-style: none;
  width: auto;
`;

const StyledLi = styled.li`
  list-style: none;
  padding: 4px;
  align-text: center;
  background: rgb(0, 14, 122);
  height: 18px;
  width: 97%;
  align-self: center;
  color: white;
`;

const Friendbrowser: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  let [incomingFriends, setIncomingFriends] = useState<IUser[]>([]);
  let [friends, setFriends] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const triggerReload = () => {
    setReloadTrigger((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchIncomingFriends();
      await fetchFriends();
      setIsLoading(false);
    };
    fetchData();
  }, [reloadTrigger, $display]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchIncomingFriends = async () => {
    try {
      const res: Response = await fetch(
        `${BACKEND}/users/get-received-friend-requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const friends = await res.json();
      setIncomingFriends(friends);
    } catch (error) {
      console.error("Error fetching pendingFriendRequests:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const res: Response = await fetch(`${BACKEND}/users/get-friends`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const friends = await res.json();
      setFriends(friends);
    } catch (error) {
      console.error("Error fetching pendingFriendRequests:", error);
    }
  };

  if (isLoading) {
    return <div></div>;
  }

  return (
    <Moveablewindow
      title="Friends"
      positionX={800}
      positionY={400}
      positionZ={z}
      display={$display}
    >
      <Browser>
        <StyledUl>
          {friends.map((friend) => {
            return (
              <Playercard
                user={friend}
                triggerReload={triggerReload}
                key={friend.name}
              />
            );
          })}
        </StyledUl>
        {incomingFriends.length > 0 && (
          <StyledLi>
            <img
              src={require("../../images/exclamation.png")}
              height="16"
              width="16"
              alt="friend"
            />
            Friendrequests
          </StyledLi>
        )}
        {incomingFriends.length > 0 && (
          <StyledUl>
            {incomingFriends.map((users: IUser) => {
              return (
                <li key={users.name}>
                  <Playercard
                    user={users}
                    triggerReload={triggerReload}
                    key={users.name}
                  />
                </li>
              );
            })}
          </StyledUl>
        )}
      </Browser>
    </Moveablewindow>
  );
};

export default Friendbrowser;
