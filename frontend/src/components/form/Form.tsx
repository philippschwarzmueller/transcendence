import React from "react";
import styled from "styled-components";

const Form = styled.form`
  padding: 10px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  max-width: 150px;

  border-top-style: groove;
  border-top-width: 2px;
  border-top-color: rgb(230, 230, 230);

  border-left-style: groove;
  border-left-width: 2px;
  border-top-color: rgb(230, 230, 230);

  border-bottom-style: solid;
  border-bottom-width: 1;
  border-bottom-color: rgb(134, 138, 142);

  border-right-style: solid;
  border-right-width: 1;
  border-right-color: rgb(134, 138, 142);

  box-shadow: 1px 1px 0 0 rgb(230, 230, 230);
`;

export interface FormProps {
  children: React.ReactNode
}

const StyledForm: React.FC<FormProps> = (props : FormProps) => {

  return (
    <>
      <Form> { props.children } </Form>
    </>
  )
}

export default StyledForm;
