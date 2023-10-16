import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledProfilePicture = styled.img`
  max-height: 300px;
  max-width: 300px;
	box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 2px 1px 1px;
`;

const ProfilePicture: React.FC<any> = () => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const user = sessionStorage.getItem("user");
      const response = await fetch(
        `http://localhost:4000/auth/get-intra-profile-img?user=${user}`
      );
      if (!response.ok) {
        console.error(`Server error: ${response.statusText}`);
        return;
      }
      const imageUrl = await response.text();
      setImageUrl(imageUrl);
    };
    fetchData();
  }, []);

  return (
    <div>
      <StyledProfilePicture src={imageUrl} />
    </div>
  );
};

export default ProfilePicture;
