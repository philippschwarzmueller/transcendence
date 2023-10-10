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
        .then((token) => {
          if (token) {
            sessionStorage.setItem("token", token);
            sessionStorage.removeItem("code");
            setUsername(token);
            setDbEntry(token);
            setredirect(true);
          }
        });
    }
  }, [location.search]);

  async function setUsername(token: string) {
    try {
      const response = await fetch("https://api.intra.42.fr/v2/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();
      sessionStorage.setItem("user", data.login);
      return data.login;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }

  async function setDbEntry(token: string) {
    fetch("http://localhost:4000/auth/create-intra-user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				token,
			}),
		});
  }

  useEffect(() => {
    if (redirect) {
      nav("/profile");
    }
  }, [redirect, nav]);

  return null;
};

export default GetToken;
