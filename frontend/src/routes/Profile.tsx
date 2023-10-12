import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";

const friends: string[] = ["mgraefen", "fsandel", "luntiet-", "oheinzel"];

const Profile: React.FC = () => {
  let { userId } = useParams();
  let navigate = useNavigate();
  let [friends2, setFriends] = useState<any[]>([]);
  let [userData, setUserData] = useState<any>({});
  useEffect(() => {
    if (userId === undefined && !sessionStorage.getItem("user")) {
      navigate("/login");
    }
    fetch("http://localhost:4000/users")
      .then((res) => res.json())
      .then((friends) => setFriends(friends));
    fetch(`http://localhost:4000/users/${userId}`)
      .then((res) => res.json())
      .then((user) => setUserData(user));
  }, []);
  return (
    <>
      <h1>{userId || sessionStorage.getItem("user")}'s Profile</h1>
      <h2>Stats</h2>
      <p>Games played: 420</p>
      <p>Win/Loss: 69%</p>
      <p>Username fetched from backend: <b>{userData.name}</b></p>
      <h2>Fake Dummy Friends</h2>
      <CenterDiv>
        <ul
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            listStyleType: "none",
          }}
        >
          {friends.map((friend: string) => {
            return (
              <li key={friend}>
                <Playercard name={friend} />
              </li>
            );
          })}
        </ul>
      </CenterDiv>
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
          {friends2.map((friend: any) => {
            return (
              <li key={friend.name}>
                <Playercard name={friend.name} />
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
