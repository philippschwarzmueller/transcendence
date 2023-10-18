import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {useCookies} from "react-cookie";

const GetToken: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState<string | null>(null);
	const [cookies, setCookie, removeCookie] = useCookies(["user"]);
	const expiryDate : Date = new Date;
	expiryDate.setDate(expiryDate.getTime() + (24 * 60 * 60 * 1000)); // 1 day

  useEffect(() => {
    const handleTokenFetch = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code: string | null = urlParams.get("code");
      const value: string | null = sessionStorage.getItem("code");

      if (code && !value) {
        sessionStorage.setItem("code", code);
      }

      if (code && code !== value) {
        try {
          const response = await fetch(
            `http://localhost:4000/auth/get-token?code=${code}`
          );
          const token = await response.text();

          if (token) {
            sessionStorage.removeItem("code");
            const username = await setUsername(token);
            if (username) {
              setDbEntry(token);
              setUser(username);
              setRedirect(true);
            }
          }
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      }
    };

    handleTokenFetch();
  }, [location.search]);

  async function setUsername(token: string): Promise<string | null> {
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
      setCookie("user", data.login, {
        path: "/",
        expires: expiryDate,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
      });
      return data.login;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return null;
    }
  }

  function setDbEntry(token: string) {
    fetch("http://localhost:4000/auth/create-intra-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
      }),
    });
  }

  useEffect(() => {
    if (redirect && user) {
      nav(`/profile/${user}`);
    }
  }, [redirect, user, nav]);

  return null;
};

export default GetToken;
