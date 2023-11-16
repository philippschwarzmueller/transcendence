import React, { useState } from "react";
import Button from "../components/button";
import Input from "../components/input";
import Form from "../components/form";
import Pagetitle from "../components/pagetitle";
import { BACKEND } from "./SetUser";

interface signUpBody {
  name: string;
  password: string;
}

const SignUp: React.FC = () => {
  const [input, setInput] = useState<signUpBody>({ name: "", password: "" });
  async function handleSubmit(event: React.MouseEvent) {
    event.preventDefault();
    try {
      const response: Response = await fetch(`${BACKEND}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data: any = await response.json();
      if (response.ok) {
        alert(`User ${input.name} created succesfully`);
        setInput({ name: "", password: "" });
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      alert("An error occured. Please try again or ask pschwarz");
    }
  }
  return (
    <>
      <Pagetitle>Signup for your Account</Pagetitle>
      <Form>
        <Input
          value={input.name}
          onChange={(e) => setInput({ ...input, name: e.target.value })}
          label="Username"
          type="string"
          placeholder="Max Mustermann"
        ></Input>
        <Input
          value={input.password}
          onChange={(e) => setInput({ ...input, password: e.target.value })}
          type="password"
          label="Password"
          placeholder="Super Safe Password"
        ></Input>
        <Button onClick={(event: React.MouseEvent) => handleSubmit(event)}>
          Signup
        </Button>
      </Form>
    </>
  );
};

export default SignUp;
