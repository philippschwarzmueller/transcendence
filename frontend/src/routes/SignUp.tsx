import React from "react";
import Button from "../components/button";
import Input from "../components/input";
import Form from "../components/form";
import Pagetitle from "../components/pagetitle";

const SignUp: React.FC = () => {
  function handleSubmit(event: React.MouseEvent) {
    event.preventDefault();
  }
  return (
    <>
      <Pagetitle>Signup for your Account</Pagetitle>
      <Form>
        <Input
          label="Username"
          type="string"
          placeholder="Max Mustermann"
        ></Input>
        <Input
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
