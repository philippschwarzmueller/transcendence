import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AuthContext } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";

interface IProfilePicture {
  name?: string;
  profilePictureUrl?: string;
}

const StyledProfilePicture = styled.img`
  max-height: 300px;
  max-width: 300px;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 2px 1px 1px;
`;

const ProfilePicture: React.FC<IProfilePicture> = ({
  profilePictureUrl,
  name,
}) => {
  const [customAvatar, setCustomAvatar] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.user.hasCustomAvatar) {
        setIsLoading(false);
      } else {
        try {
          const res: Response = await fetch(
            `${BACKEND}/users/get-custom-avatar`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          setCustomAvatar(await res.text());
          setIsLoading(false);
        } catch (error) {
          console.error("fetching avatar failed", error);
        }
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div>
        <StyledProfilePicture
          src={customAvatar || profilePictureUrl}
          alt={`${name}'s avatar`}
        />
      </div>
    );
  }
};

export default ProfilePicture;
