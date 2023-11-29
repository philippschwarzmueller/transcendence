import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IUser } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";

interface IProfilePicture {
  name?: string;
}

const StyledFrame = styled.div`
  width: 250px;
  height: 250px;
  align-content: center;
`;

const StyledProfilePicture = styled.img`
  display: flex;
  justify-content: center;
  max-height: 250px;
  max-width: 250px;
  margin: auto;
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 2px 1px 1px;
`;

const ProfilePicture: React.FC<IProfilePicture> = ({ name }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<IUser>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: Response = await fetch(`${BACKEND}/users/${name}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        setUser(await res.json());
        setIsLoading(false);
      } catch (error) {
        console.error("fetching user for avatar/profilepicture failed", error);
      }
    };
    fetchData();
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <StyledFrame>
      <StyledProfilePicture
        src={
          user?.hasCustomAvatar ? user.customAvatar : user?.profilePictureUrl
        }
        alt={`${user?.name}'s avatar`}
      />
    </StyledFrame>
  );
};

export default ProfilePicture;
