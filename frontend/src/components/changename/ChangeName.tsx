import React, { useContext, useState } from "react";
import Input from "../input";
import Button from "../button";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IAuthContext, IUser } from "../../context/auth";
import { styled } from "styled-components";
import DOMPurify from "dompurify";

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
    const cleanConfig = { ALLOWED_TAGS: [] };
    const sanitizedNewName = DOMPurify.sanitize(newName, cleanConfig)
    if (!isWhitespaceOrEmpty(sanitizedNewName)) {
      try {
        const res: Response = await fetch(`${BACKEND}/auth/change-name`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newName: sanitizedNewName }),
          credentials: "include",
        });
        const updatedUser: IUser = await res.json();
        if (
          updatedUser.name !== auth.user.name &&
          updatedUser.name !== undefined
        ) {
          auth.logIn(updatedUser);
          setNewName("");
          alert(`Name changed to '${sanitizedNewName}'`);
        } else {
          alert("Name already exists, pick another one");
          setNewName("");
        }
      } catch {
        console.error("error");
      }
    } else {
      setNewName("");
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
