import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagetitle from "../components/pagetitle/";
import { AuthContext } from "../context/auth";
import Button from "../components/button";

const Home: React.FC = () => {
  const auth = useContext(AuthContext);
  const [validity, setValidity] = useState(false);
  let navigate = useNavigate();

  const handleClick = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/auth/validate-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: auth.user.name,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (data == null) {
        navigate("/login");
      }
      if (auth.user.name === undefined) {
        auth.logIn({
          id: Number(data.id),
          name: data.name,
          image: data.profilePictureUrl,
        });
      }
      setValidity(data !== null);
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          height: "95vh",
        }}
      >
        <Pagetitle>Welcome to WinPong, {auth.user.name}</Pagetitle>
        <h1>Is my Session valid?</h1>
        <Button onClick={handleClick}>{validity ? "Valid" : "Invalid"}</Button>
      </div>
    </>
  );
};

export default Home;
