import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";

const Profile: React.FC = () => {
  return (
    <>
      <h1>Profile</h1>
      <h2>Stats</h2>
      <h2>Friends</h2>
      <Link to="/profile/settings">
        <Button>Change Settings</Button>
      </Link>
    </>
  );
};

export default Profile;
