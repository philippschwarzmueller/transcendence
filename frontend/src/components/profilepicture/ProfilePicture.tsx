import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IUser } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";

interface IProfilePicture {
  name?: string;
}

const StyledProfilePicture = styled.img`
  max-height: 300px;
  max-width: 300px;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 2px 1px 1px;
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
        console.log(user);
      } catch (error) {
        console.error("fetching user for avatar/profilepicture failed", error);
      }
    };
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading /* || user === undefined */) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <StyledProfilePicture
        src={user?.hasCustomAvatar ? user.customAvatar : user?.profilePictureUrl}
        alt={`${name}'s avatar`}
      />
    </div>
  );
};

export default ProfilePicture;
