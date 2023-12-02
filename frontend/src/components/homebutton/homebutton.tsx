import React from "react";
import styled from "styled-components";
import icon from "../../images/errorbutton.png";
import { NavigateFunction, useNavigate } from "react-router-dom";

export const ButtonWrapper = styled.div`
  background-color: rgb(195, 199, 203);
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  border-top: 1px solid white;
  border-left: 1px solid white;
  border-bottom: 1px solid black;
  border-right: 1px solid black;
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
`;

const Homebutton: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();
  return (
    <>
      <ButtonWrapper onClick={() => navigate("/Home")}>
        <img src={icon} alt="icon" />
      </ButtonWrapper>
    </>
  );
};

export default Homebutton;
