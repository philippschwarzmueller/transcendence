import React, { useState } from "react";
import Button from "../components/button";
import Input from "../components/input";
import Form from "../components/form";
import Pagetitle from "../components/pagetitle";

interface signUpBody {
  name: string;
  password: string;
}

const SignUp: React.FC = () => {
  const [input, setInput] = useState<signUpBody>({ name: "", password: "" });
  async function handleSubmit(event: React.MouseEvent) {
    event.preventDefault();
    try {
      const response: Response = await fetch(
        "http://localhost:4000/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      const data: any = await response.json();
      if (response.ok) {
        alert(`User ${input.name} created succesfully`);
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
          onChange={(e) => setInput({ ...input, name: e.target.value })}
          label="Username"
          type="string"
          placeholder="Max Mustermann"
        ></Input>
        <Input
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
