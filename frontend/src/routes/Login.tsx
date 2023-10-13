import React, { useContext, useState } from "react";
import Button from "../components/button";
import Input from "../components/input";
import Form from "../components/form";
import Pagetitle from "../components/pagetitle";
import { AuthContext } from "../routes/root";

interface loginBody {
  name: string;
  password: string;
}

const Login: React.FC = () => {
  const [input, setInput] = useState<loginBody>({ name: "", password: "" });
  const auth = useContext(AuthContext);

  const handleSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      const response: Response = await fetch(
        "http://localhost:4000/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      );

      const data: any = await response.json();

      if (response.ok) {
        alert("Login Successful!");
        setInput({ name: "", password: "" });
        sessionStorage.setItem("user", data.name);
      } else {
        alert("Login Failed: " + (data.message || "Unknown Error"));
      }
    } catch (error) {
      alert("Login Failed: Network Error or Request couldn't be made");
    }
  };

  const handleIntraLogin = async (event: React.MouseEvent) => {
    window.location.replace("http://localhost:4000/auth/intra-login");
  };

  return (
    <>
      <Pagetitle>Login to your Account</Pagetitle>
      {window.sessionStorage.getItem("user") ? (
        <span>Logged in as {window.sessionStorage.getItem("user")}</span>
      ) : (
        <span>Logged out</span>
      )}
      <h1>{auth.loggedIn.name}</h1>
      <h2>{auth.loggedIn.token}</h2>
      <Form>
        <Input
          value={input.name}
          onChange={(e) => setInput({ ...input, name: e.target.value })}
          label="Username"
          type="string"
          placeholder="Your Username"
        ></Input>
        <Input
          value={input.password}
          onChange={(e) => setInput({ ...input, password: e.target.value })}
          label="Password"
          type="password"
          placeholder="Your Username"
        ></Input>
        <Button onClick={(event: React.MouseEvent) => handleSubmit(event)}>
          Login
        </Button>
      </Form>
      <Button onClick={() => sessionStorage.removeItem("user")}>Log Out</Button>
      <Button onClick={(event: React.MouseEvent) => handleIntraLogin(event)}>
        Login via 42 intra
      </Button>
    </>
  );
};

export default Login;
