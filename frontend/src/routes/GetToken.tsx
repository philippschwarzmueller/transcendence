import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth";
import { useCookies } from "react-cookie";

const GetToken: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);
	const expiryDate : Date = new Date();
	expiryDate.setTime(expiryDate.getTime()+ (24 * 60 * 60 * 1000)); // 1 day
	const [cookies, setCookie] = useCookies(['user']);
  let auth = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code: string | null = urlParams.get("code");
    if (code) {
      fetch(`http://localhost:4000/auth/get-token?code=${code}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((res) => {
          if (res) {
            auth.logIn({
              id: res.id,
              name: res.name,
              image: res.profilePictureUrl,
              token: res.token,
            }
						);
						setCookie('user', res.name, { path: '/', expires: expiryDate });
          }
          setRedirect(true);
        });
    }
  }, [auth, location.search]);

  useEffect(() => {
    if (redirect) {
      nav("/profile");
    }
  }, [nav, redirect]);

  return null;
};

export default GetToken;
