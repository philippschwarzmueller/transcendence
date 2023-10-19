import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth";

const GetToken: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);

  let auth = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const name: string | null = urlParams.get("name");
    const profilePictureUrl: string | null = urlParams.get("profilePictureUrl");
		const id: string | null = urlParams.get("id");
		console.log(` in get Token ${id}`);

    if (name && profilePictureUrl) {
      auth.logIn({
        id: Number(id),
        name: name,
        image: profilePictureUrl,
        token: "jaja"
      }
			);
			console.log(`${Number(id)}`);
    }
    setRedirect(true);
  }, [location.search]);

  useEffect(() => {
    if (redirect) {
      nav("/profile");
    }
  }, [nav, redirect]);

  return null;
};

export default GetToken;
