import React from "react";
import styled from "styled-components";

const ImageContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
`;

const StyledImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left-top;
`;

export interface IAvatar {
  name?: string;
  src?: string;
}

const Avatar: React.FC<IAvatar> = ({ name = "user", src }) => {
  return (
    <>
      <ImageContainer>
        <StyledImg src={src} alt={`${name}'s avatar`} />
      </ImageContainer>
    </>
  );
};

export default Avatar;
