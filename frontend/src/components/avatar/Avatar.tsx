import React from "react";
import styled from "styled-components";

const StyledImg = styled.img`
  max-height: 50px;
  max-width: 50px;
  border-radius: 50%;
`;

export interface IAvatar {
  src?: string;
}

const Avatar: React.FC<IAvatar> = ({
  src = "https://ideastest.org.uk/wp-content/uploads/2019/04/default-avatar-1.jpg",
}) => {
  return (
    <>
      <StyledImg src={src} alt={`avatar`} />
    </>
  );
};

export default Avatar;
