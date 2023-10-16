import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";

export interface IUser {
  id: number;
  name: string;
  profilePictureUrl: string;
}

const Profile: React.FC = () => {
  let { userId } = useParams();
  let navigate = useNavigate();
  if (userId === undefined && !sessionStorage.getItem("user")) {
    navigate("/login");
  }

  let [users, setUsers] = useState<IUser[]>([]);
  useEffect(() => {
    fetch(`http://localhost:4000/users`)
      .then((res) => res.json())
      .then((users) => setUsers(users));
  }, []);

  let [user, setUser] = useState<IUser>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:4000/users/${userId}`);
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <>
      <h1>{userId || sessionStorage.getItem("user")}'s Profile</h1>
      {user && (
        <ProfilePicture
          profilePictureUrl={user.profilePictureUrl}
          name={user?.name}
        ></ProfilePicture>
      )}
      <h2>Stats</h2>
      <p>Games played: 420</p>
      <p>Win/Loss: 69%</p>
      <h2>All Users From Backend As Friends</h2>
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
                <Playercard
                  name={users.name}
                  profilePictureUrl={users.profilePictureUrl}
                  id={users.id}
                />
              </li>
            );
          })}
        </ul>
      </CenterDiv>
      {userId === undefined ? (
        <Link to="/profile/settings">
          <Button>Change Settings</Button>
        </Link>
      ) : null}
    </>
  );
};

export default Profile;
