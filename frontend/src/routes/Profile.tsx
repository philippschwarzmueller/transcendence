import React, { useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/button";
import Playercard from "../components/playercard";
import CenterDiv from "../components/centerdiv";
import ProfilePicture from "../components/profilepicture/ProfilePicture";
import { AuthContext } from "../context/auth";

const friends: string[] = ["mgraefen", "fsandel", "luntiet-", "oheinzel"];

const Profile: React.FC = () => {
  const auth = useContext(AuthContext);
  let { userId } = useParams();
  let navigate = useNavigate();
  useEffect(() => {
    if (userId === undefined && !auth.user.token) {
      navigate("/login");
    }
  }, [navigate, userId]);
  return (
    <>
      <h1>{auth.user.name}'s Profile</h1>
      <ProfilePicture></ProfilePicture>
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
