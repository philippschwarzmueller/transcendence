import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth";

const GetToken: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setredirect] = useState(false);

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
              image: res.image,
              token: res.token,
            });
          }
          setredirect(true);
        });
    }
  }, []);

  useEffect(() => {
    if (redirect) {
      nav("/profile");
    }
  }, [redirect, nav]);

  return null;
};

export default GetToken;
