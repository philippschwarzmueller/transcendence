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
  const [profileLink, setProfileLink] = useState(`${auth.user.name}`);

  function isWhitespaceOrEmpty(input: string) {
    return /^\s*$/.test(input);
  }

  const handleNameChange = async (): Promise<void> => {
    if (!isWhitespaceOrEmpty(newName)) {
      try {
        const res = await fetch(`${BACKEND}/auth/change-name`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newName }),
          credentials: "include",
        });
        const updatedUser: IUser = await res.json();
        if (updatedUser.name !== auth.user.name) {
          auth.logIn(updatedUser);
          if (updatedUser.name !== undefined) {
            setProfileLink(updatedUser.name);
            alert(`Name changed to '${newName}'`);
            setNewName("");
          }
        } else {
          alert("Name already exists, pick another one");
          setNewName("");
        }
      } catch {
        console.log("error");
      }
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
      />
      <Button onClick={handleNameChange}>Change Name</Button>
      <h3>Change Avatar</h3>
      <h3>Enable 2FA</h3>
      <Link to={`/profile/${profileLink}`}>
        <Button>Back to Profile</Button>
      </Link>
    </>
  );
};

export default ProfileSettings;
