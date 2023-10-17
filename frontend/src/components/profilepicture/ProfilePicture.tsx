import React from "react";
import styled from "styled-components";

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
  return (
    <div>
      <StyledProfilePicture src={profilePictureUrl} alt={`${name}'s avatar`} />
    </div>
  );
};

export default ProfilePicture;
