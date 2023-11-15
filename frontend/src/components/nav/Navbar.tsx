import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledNavbar = styled.nav`
  bottom: 0px;
  left: 0px;
  right: 0px;
  -webkit-box-pack: justify;
  width: 100vw;
  height: 5vh;
  z-index: 2;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

const StyledLink = styled(Link)``;

const StyledLi = styled.button`
  background-color: rgb(195, 199, 203);
  border: none;
  outline: none;
  max-width: 150px;
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 9px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
`;

const Navbar: React.FC = () => {
  return (
    <StyledNavbar>
      <ul style={{ listStyle: "none", display: "inline-flex" }}>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/home"}>Home</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/play"}>Play</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/chat"}>Chat</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/signup"}>Signup</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/login"}>Login</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/queue"}>Queue</StyledLink>
        </StyledLi>
        <StyledLi></StyledLi>
      </ul>
    </StyledNavbar>
  );
};

export default Navbar;
