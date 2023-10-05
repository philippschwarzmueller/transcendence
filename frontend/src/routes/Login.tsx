import React, { useState } from "react";
import Button from "../components/button";
import Input from "../components/input";
import Form from "../components/form";
import Pagetitle from "../components/pagetitle";

interface loginBody {
  name: string;
  password: string;
}

const Login: React.FC = () => {
  const [input, setInput] = useState<loginBody>({ name: "", password: "" });

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

      const data = await response.json();

      if (response.ok) {
        alert("Login Successful!");
        setInput({ name: "", password: "" });
      } else {
        alert("Login Failed: " + (data.error || "Unknown Error"));
      }
    } catch (error) {
      alert("Login Failed: Network Error or Request couldn't be made");
    }
  };

  return (
    <>
      <Pagetitle>Login to your Account</Pagetitle>
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
    </>
  );
};

export default Login;
