import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";

const friends: string[] = ["mgraefen", "fsandel", "luntiet-", "oheinzel"];

const Profile: React.FC = () => {
  return (
    <>
      <h1>Profile</h1>
      <h2>Stats</h2>
      <p>Games played: 420</p>
      <p>Win/Loss: 69%</p>
      <h2>Friends</h2>
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
      <Link to="/profile/settings">
        <Button>Change Settings</Button>
      </Link>
    </>
  );
};

export default Profile;
