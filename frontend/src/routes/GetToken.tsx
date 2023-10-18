import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth";

export function getCookie(cname: string): string {
  const name: string = cname + "=";
  const cookies: string[] = decodeURIComponent(document.cookie).split(";");
  const foundCookie: string | undefined = cookies.find((cookie) =>
    cookie.trim().startsWith(name),
  );
  return foundCookie ? foundCookie.trim().substring(name.length) : "";
}

export function setCookie(cname: string, cvalue: string, exdays: number) {
  const date: Date = new Date();
  date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires: string = `expires=${date.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/;secure;httpOnly;sameSite=Lax`;
}

const GetToken: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);

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
            });
            setCookie("token", res.token, 7);
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
