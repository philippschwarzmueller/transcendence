import React, { useContext, useState } from "react";
import Input from "../input";
import Button from "../button";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IAuthContext, IUser } from "../../context/auth";
import { styled } from "styled-components";

const Container = styled.div`
  padding: 5px;
  margin: 5px;
`;

const NameChangeSection: React.FC = () => {
  const [newName, setNewName] = useState("");
  const auth: IAuthContext = useContext(AuthContext);

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
          updatedUser.name !== undefined
        ) {
          auth.logIn(updatedUser);
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
      <Container>
        <Input
          placeholder="new name goes here"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={handleNameChange}>Change Name</Button>
      </Container>
    </>
  );
};

export default NameChangeSection;
