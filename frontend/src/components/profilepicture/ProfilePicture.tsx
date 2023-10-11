import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledProfilePicture = styled.img``;

interface ProfilePictureProps {
  size: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ size }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:4000/get-intra-profile-img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, size }),
      });
      const data = await response.json();
      if (data && data.data) {
        setImageUrl(data.data);
      }
    };
    
    fetchData();
  }, [size]);

  return (
    <div>
      {imageUrl ? <StyledProfilePicture src={imageUrl} /> : "Loading..."}
    </div>
  );
};

export default ProfilePicture;


