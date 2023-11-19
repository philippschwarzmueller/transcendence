import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";
import { IUser, AuthContext } from "../context/auth";
import { BACKEND } from "./SetUser";


const Profile: React.FC = () => {
  const auth = useContext(AuthContext);
  let { userId } = useParams();
  let [user, setUser] = useState<IUser>();
  const [ownProfile, setOwnProfile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          const res = await fetch(`${BACKEND}/users/${userId}`);
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          const profileUser = await res.json();
          setUser(profileUser);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        setUser(auth.user);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    if (auth.user.name === userId) {
      setOwnProfile(true);
    }
  }, [user])

  return (
    <>
      <h1>{user?.name}'s Profile</h1>
      <p>{user?.profilePictureUrl}</p>
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
      <h2>All Users From Backend As Friends</h2>
      {/*  <CenterDiv>
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
                <Playercard
                  name={users.name}
                  image={users.image}
                  id={users.id}
                />
              </li>
            );
          })}
        </ul>
      </CenterDiv> */}
      {userId === undefined ? (
        <Link to="/profile/settings">
          <Button>Change Settings</Button>
        </Link>
      ) : null}
    </>
  );
};

export default Profile;
