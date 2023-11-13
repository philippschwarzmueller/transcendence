import React, { useEffect } from "react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";
import { AuthContext, IUser } from "../context/auth";
import Input from "../components/input";

const ProfileSettings: React.FC = () => {
  const auth = useContext(AuthContext);
  const BACKEND: string = `http://${window.location.hostname}:${4000}`;
  const [newName, setNewName] = useState("");

  const handleNameChange = async (): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND}/auth/change-name`);
      console.log(await res.json());
    } catch {
      console.log("error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewName(e.target.value);
  };

  return (
    <>
      <h1>Profile Settings</h1>
      <Input
        label="New profile name"
        placeholder="new name goes here"
        value={newName}
        onChange={handleInputChange}
      >
        {newName}
      </Input>
      <Button onSubmit={handleNameChange}>Change Name</Button>
      <h3>Change Avatar</h3>
      <h3>Enable 2FA</h3>
      <Link to={`/profile/${auth.user.name}`}>
        <Button>Back to Profile</Button>
      </Link>
    </>
  );
};

export default ProfileSettings;
