import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";
import { AuthContext } from "../context/auth";
import { BACKEND } from "./SetUser";

export interface IUser {
  id: number;
  name: string;
  profilePictureUrl: string;
}

const Profile: React.FC = () => {
  const auth = useContext(AuthContext);
  let { userId } = useParams();
  let navigate = useNavigate();
  let [user, setUser] = useState<IUser>();

  useEffect(() => {
    if (userId === undefined && !auth.user.token) {
      navigate("/login");
    }
    if (userId) {
      fetch(`${BACKEND}/users/${userId}`)
        .then((res) => res.json())
        .then((resuser) => setUser(resuser));
    }
  }, [auth.user.token, navigate, userId]);

  let [users, setUsers] = useState<IUser[]>([]);
  useEffect(() => {
    fetch(`${BACKEND}/users`)
      .then((res) => res.json())
      .then((users) => setUsers(users));
  }, []);

  return (
    <>
      <h1>{user ? user.name : auth.user.name}'s Profile</h1>
      <p>{user ? user.profilePictureUrl : auth.user.image}</p>
      <ProfilePicture
        name={user ? user.name : auth.user.name}
        profilePictureUrl={user ? user.profilePictureUrl : auth.user.image}
      ></ProfilePicture>
      <Link to="/profile/settings">
        <Button>Profile Settings</Button>
      </Link>
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
