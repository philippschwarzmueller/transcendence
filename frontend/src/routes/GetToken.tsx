import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const GetToken: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setredirect] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code: string | null = urlParams.get("code");
    const value: string | null = sessionStorage.getItem("code");
    if (code && !value) {
      sessionStorage.setItem("code", code);
    }
    if (code && code !== value) {
      fetch(`http://localhost:4000/auth/get-token?code=${code}`)
        .then((response) => response.text())
        .then((text) => {
          if (text) {
            sessionStorage.setItem("token", text);
            sessionStorage.removeItem("code");
            setUsername(text);
            setredirect(true);
          }
        });
    }
  }, []);

  function setUsername(token: string) {
    fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem("user", data.login);
      });
  }
  useEffect(() => {
    if (redirect) {
      nav("/chat");
    }
  }, [redirect, nav]);

  return null;
};

export default GetToken;
