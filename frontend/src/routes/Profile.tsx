import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";

const friends: string[] = ["mgraefen", "fsandel", "luntiet-", "oheinzel"];

const Profile: React.FC = () => {
  let { userId } = useParams();
  let navigate = useNavigate();
  useEffect(() => {
    if (userId === undefined && !sessionStorage.getItem("user")) {
      navigate("/login");
    }
  }, []);
  return (
    <>
      <h1>{userId || sessionStorage.getItem("user")}'s Profile</h1>
			<ProfilePicture size="medium"></ProfilePicture>
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
      {userId === undefined ? (
        <Link to="/profile/settings">
          <Button>Change Settings</Button>
        </Link>
      ) : null}
    </>
  );
};

export default Profile;
