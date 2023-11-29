import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";
import { IUser, AuthContext, IAuthContext } from "../context/auth";
import { BACKEND } from "./SetUser";
import Taskbar from "../components/taskbar/Taskbar";

const Profile: React.FC = () => {
  const auth: IAuthContext = useContext(AuthContext);
  let { userId } = useParams();
  let [user, setUser] = useState<IUser>();
  let [users, setUsers] = useState<IUser[]>([]);
  let [incomingFriends, setIncomingFriends] = useState<IUser[]>([]);
  let [friends, setFriends] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ownProfile, setOwnProfile] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const triggerReload = () => {
    setReloadTrigger((prev) => !prev);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setOwnProfile(auth.user.name === userId);
      await fetchIncomingFriends();
      await fetchFriends();
      await fetchUser();
      await fetchUsers();
      setIsLoading(false);
    };
    fetchData();
  }, [reloadTrigger, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    if (userId) {
      try {
        const res: Response = await fetch(`${BACKEND}/users/${userId}`);
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        const profileUser: IUser = await res.json();
        setUser(profileUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    } else {
      setUser(auth.user);
    }
  };

  const fetchUsers = async () => {
    try {
      const res: Response = await fetch(`${BACKEND}/users`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const users: IUser[] = await res.json();
      setUsers(users);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

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
        }
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
        headers: {
          "Content-Type": "application/json",
        },
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
    return <div>Loading...</div>;
  }

  return (
    <>
      <Taskbar />
      <h1>{user?.name}'s Profile</h1>
      <ProfilePicture name={user?.name} />
      {ownProfile && (
        <Link to="/profile/settings">
          <Button>Profile Settings</Button>
        </Link>
      )}
      <h2>Stats</h2>
      <p>Games played: 420</p>
      <p>Win/Loss: 69%</p>
      <h2>User List</h2>
      <CenterDiv>
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            listStyleType: "none",
          }}
        >
          {users.map((users: IUser) => {
            return (
              <li key={users.name}>
                <Playercard user={users} triggerReload={triggerReload} />
              </li>
            );
          })}
        </ul>
      </CenterDiv>
      {ownProfile && incomingFriends.length > 0 && (
        <h2>Incoming friend requests</h2>
      )}
      {ownProfile && incomingFriends.length > 0 && (
        <CenterDiv>
          <ul
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              listStyleType: "none",
            }}
          >
            {incomingFriends.map((users: IUser) => {
              return (
                <li key={users.name}>
                  <Playercard user={users} triggerReload={triggerReload} />
                </li>
              );
            })}
          </ul>
        </CenterDiv>
      )}
      {ownProfile && friends.length > 0 && <h2>Friends</h2>}
      {ownProfile && friends.length > 0 && (
        <CenterDiv>
          <ul
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              listStyleType: "none",
            }}
          >
            {friends.map((users: IUser) => {
              return (
                <li key={users.name}>
                  <Playercard user={users} triggerReload={triggerReload} />
                </li>
              );
            })}
          </ul>
        </CenterDiv>
      )}
    </>
  );
};

export default Profile;
