import React from "react";
import Button from "../components/button";
import Input from "../components/input";
import Form from "../components/form";
import Pagetitle from "../components/pagetitle";

//const StyledRegister = styled.register'';

const Register: React.FC = () => {
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
          label="Password"
          type="string"
          placeholder="SuperSave Password"
        ></Input>
        <Button>Signup</Button>
      </Form>
    </>
  );
};

export default Register;
