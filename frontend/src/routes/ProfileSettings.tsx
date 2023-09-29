import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";

const ProfileSettings: React.FC = () => {
  return (
    <>
      <h1>Profile Settigns</h1>
      <h3>Change Name</h3>
      <h3>Change Avatar</h3>
      <h3>Enable 2FA</h3>
      <Link to="/profile">
        <Button>Back to Profile</Button>
      </Link>
    </>
  );
};

export default ProfileSettings;
