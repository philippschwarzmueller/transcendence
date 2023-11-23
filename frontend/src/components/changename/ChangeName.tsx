import React from "react";
import Input from "../input";
import Button from "../button";

interface NameChangeSectionProps {
  newName: string;
  setNewName: (name: string) => void;
  handleNameChange: () => Promise<void>;
}

const NameChangeSection: React.FC<NameChangeSectionProps> = ({
  newName,
  setNewName,
  handleNameChange,
}) => (
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

export default NameChangeSection;
