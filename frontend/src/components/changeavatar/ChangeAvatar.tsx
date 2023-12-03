import React, { useContext, useState } from "react";
import Input from "../input";
import Button from "../button";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext } from "../../context/auth";
import { styled } from "styled-components";
import { ProfileContext } from "../../context/profile";

const Container = styled.div`
  padding: 5px;
  margin: 5px;
`;

const AvatarChangeSection: React.FC = () => {
  const [avatar, setAvatar] = useState<string>("");
  const auth = useContext(AuthContext);
  const profile = useContext(ProfileContext);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        setAvatar("");
        return;
      }
      if (file.size <= 2000000) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setAvatar(base64String);
        };
        reader.readAsDataURL(file);
      } else {
        setAvatar("");
        alert("File size should be 1.5 MB or less.");
      }
    }
  };

  const handleAvatarUpload = async () => {
    if (avatar) {
      try {
        const res = await fetch(`${BACKEND}/users/change-avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar }),
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const uploadSuccessful: boolean = await res.json();
        if (uploadSuccessful) {
          auth.user.hasCustomAvatar = true;
          auth.user.customAvatar = avatar;
          profile.updateProfile(auth.user, profile.profile.display);
        }
      } catch (error) {
        console.error("Avatar upload failed", error);
      }
    }
  };

  const handleBacktoDefaultAvatar = async () => {
    try {
      const res = await fetch(
        `${BACKEND}/users/back-to-fallback-profilepicture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ avatar }),
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const success: boolean = await res.json();
      if (success) {
        auth.user.hasCustomAvatar = false;
        auth.user.profilePictureUrl = avatar;
        profile.updateProfile(auth.user, profile.profile.display);
      }
    } catch (error) {
      console.error("Back to fallback profile picture failed", error);
    }
  };

  return (
    <>
      <Container>
        <Input label="Change Avatar"
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          onChange={handleAvatarChange}
        />
        <Button onClick={handleAvatarUpload}>Upload new Avatar</Button>
        {auth.user.hasCustomAvatar && (
          <div>
            <Button onClick={handleBacktoDefaultAvatar}>
              Change back to default Avatar
            </Button>
          </div>
        )}
      </Container>
    </>
  );
};

export default AvatarChangeSection;
