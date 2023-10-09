import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledProfilePicture = styled.img``;

const ProfilePicture: React.FC = () => {
  const [smallImageUrl, setSmallImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:4000/auth/profilepicture")
      .then((response) => response.json())
      .then((data) => {
        //setSmallImageUrl(data.image.versions.small);
				console.log(data);
      });
  }, []);

  return (
    <div>
      {smallImageUrl ? <StyledProfilePicture src={smallImageUrl} /> : null}
    </div>
  );
};

export default ProfilePicture;
