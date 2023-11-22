import React, { useState } from 'react';
import Input from "../input";
import Button from "../button";

const AvatarChangeSection: React.FC = () => {
  const [avatar, setAvatar] = useState<string>("");
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0){
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async (): Promise<void> => {
    // Implement the logic to upload the avatar
    // For example, sending it to a backend server
    console.log("Uploading avatar:", avatar);
    // Perform the upload logic here...
  };

  return (
    <>
      <Input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <Button onClick={handleAvatarUpload}>Upload new Avatar</Button>
    </>
  );
};

export default AvatarChangeSection;
