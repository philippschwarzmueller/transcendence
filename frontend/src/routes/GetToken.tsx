import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GetToken: React.FC = () => {
  const location = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    if (code) {
      fetch(`http://localhost:4000/auth/get-token?code=${code}`)
        .then((response) => response.text())
        .then((text) => {
          if (text) {
            sessionStorage.setItem("token", text);
            nav("/profile");
          }
        });
    }
  }, [location, nav]);

  return null;
};

export default GetToken;

