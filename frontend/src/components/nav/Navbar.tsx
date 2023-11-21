import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../context/auth";
import Queuebox from "../queuebox";

const StyledNavbar = styled.nav`
  bottom: 0px;
  left: 0px;
  right: 0px;
  width: 100vw;
  height: 8vh;
  z-index: 2;
  background-color: rgb(195, 199, 203);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
`;

const StyledLink = styled(Link)`
  font-size: 25px;
`;

const StyledLi = styled.button`
  background-color: rgb(195, 199, 203);
  border: none;
  outline: none;
  max-width: 400px;
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 9px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
`;

const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  return (
    <StyledNavbar>
      <ul style={{ listStyle: "none", display: "inline-flex" }}>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/home"}>Home</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/chat"}>Chat</StyledLink>
        </StyledLi>
        <StyledLi style={{ padding: 10 }}>
          <StyledLink to={"/login"}>Login</StyledLink>
        </StyledLi>
        {auth.user.intraname !== undefined && <StyledLi style={{ padding: 10 }}>
          <StyledLink to={`/profile/${auth.user.name}`}>My Profile</StyledLink>
        </StyledLi>}
        <div style={{ padding: "10px" }}>
          <Queuebox></Queuebox>
        </div>
      </ul>
    </StyledNavbar>
  );
};

export default Navbar;
