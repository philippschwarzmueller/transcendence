import React, { useContext, useState } from "react";
import Input from "../input";
import Button from "../button";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IAuthContext, IUser } from "../../context/auth";

interface NameChangeProps {
  setProfileLink: (profileLink: string) => void;
}

const NameChangeSection: React.FC<NameChangeProps> = ({
  setProfileLink,
}) => {
  const [newName, setNewName] = useState("");
  const auth: IAuthContext  = useContext(AuthContext);

  const isWhitespaceOrEmpty = (input: string): boolean => {
    return /^\s*$/.test(input);
  };

  const handleNameChange = async (): Promise<void> => {
    if (!isWhitespaceOrEmpty(newName)) {
      try {
        const res: Response = await fetch(`${BACKEND}/auth/change-name`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newName }),
          credentials: "include",
        });
        const updatedUser: IUser = await res.json();
        if (
          updatedUser.name !== auth.user.name &&
          updatedUser.name != undefined
        ) {
          auth.logIn(updatedUser);
          setProfileLink(updatedUser.name);
          setNewName("");
          alert(`Name changed to '${newName}'`);
        } else {
          alert("Name already exists, pick another one");
          setNewName("");
        }
      } catch {
        console.error("error");
      }
    }
  };

  return (
    <>
      <Input
        label="New profile name"
        placeholder="new name goes here"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <Button onClick={handleNameChange}>Change Name</Button>
    </>
  );
};

export default NameChangeSection;
