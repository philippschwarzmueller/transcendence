import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";
import { IUser, AuthContext, IAuthContext } from "../context/auth";
import { BACKEND } from "./SetUser";


const Profile: React.FC = () => {
  const auth: IAuthContext = useContext(AuthContext);
  let { userId } = useParams();
  let [user, setUser] = useState<IUser>();
  let [incomingFriends, setIncomingFriends] = useState<IUser[]>([])
  const [ownProfile, setOwnProfile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const res: Response = await fetch(`${BACKEND}/users/${userId}`);
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          const profileUser: IUser = await res.json();
          setUser(profileUser);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        setUser(auth.user);
      }
    };
    
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (auth.user.name === userId) {
      setOwnProfile(true);
    }
  }, [user])

  useEffect(() => {
    const fetchIncomingFriends = async () => {
      try {
        const res: Response = await fetch(`${BACKEND}/users/get-received-friend-requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const friends = await res.json();
        setIncomingFriends(friends);
        console.log(incomingFriends)
      } catch(error) {
        console.error('Error fetching pendingFriendRequests:', error);
      }
    }
    fetchIncomingFriends();
  }, [])

  return (
    <>
      <h1>{user?.name}'s Profile</h1>
      <ProfilePicture
        name={user?.name}
        profilePictureUrl={user?.profilePictureUrl}
      />
      {ownProfile && (
        <Link to="/profile/settings">
          <Button>Profile Settings</Button>
        </Link>
      )}
      <h2>Stats</h2>
      <p>Games played: 420</p>
      <p>Win/Loss: 69%</p>
      {ownProfile && <h2>Incoming friend requests</h2>}
      { <CenterDiv>
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
                <Playercard
                  name={users?.name}
                  profilePictureUrl={users?.profilePictureUrl}
                  id={users.id}
                />
              </li>
            );
          })}
        </ul>
      </CenterDiv>}
      {userId === undefined ? (
        <Link to="/profile/settings">
          <Button>Change Settings</Button>
        </Link>
      ) : null}
    </>
  );
};

export default Profile;
