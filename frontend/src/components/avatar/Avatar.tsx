import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledImg = styled.img`
  max-height: 50px;
  max-width: 50px;
  border-radius: 50%;
`;

export interface IAvatar {
  src?: string;
  name?: string;
}

async function getUserImage(user: string): Promise<string> {
  try {
    const src = await fetch(
      `http://localhost:4000/auth/get-intra-profile-img?user=${user}`
    );
    const imageUrl = await src.text();
    return imageUrl;
  } catch (error) {
    return "";
  }
}

const Avatar: React.FC<IAvatar> = ({ name = "user" }) => {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    async function fetchImage() {
      const url = await getUserImage(name);
      setSrc(url);
    }
    fetchImage();
  }, [name]);

  return (
    <>
      <StyledImg src={src} alt={`${name}'s avatar`} />
    </>
  );
};

export default Avatar;
