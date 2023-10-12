import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledProfilePicture = styled.img``;

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
