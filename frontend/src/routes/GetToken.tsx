import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GetToken: React.FC = () => {
  const location = useLocation();
  const nav = useNavigate();
	console.log("Intra gets called");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
		console.log(location.search);
    const code = urlParams.get("code");
    if (code) {
      fetch(`http://localhost:4000/auth/get-token?code=${code}`)
        .then((response) => response.text())
        .then((text) => {
          if (text) {
            sessionStorage.setItem("token", text);
						nav("/profile");
          };
        })
    }
  }, []);

  return (
    /* <h1>Login successful</h1> */
    null
  );
};

export default GetToken;
