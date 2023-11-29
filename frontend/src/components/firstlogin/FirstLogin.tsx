import React from "react";
import NameChangeSection from "../changename/ChangeName";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";
import styled from "styled-components";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import { Link } from "react-router-dom";
import Button from "../button/Button";
import WindowWrapper from "../outlinecontainer/outlinecontainer";

const StyledWindow = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5px;
  background-color: rgb(195, 199, 203);
  --x-shadow: inset 0.5px 0.5px 0px 0.5px #ffffff, inset 0 0 0 1px #868a8e,
    1px 0px 0 0px #000000, 0px 1px 0 0px #000000, 1px 1px 0 0px #000000;
  box-shadow: var(--x-ring-shadow, 0 0 #0000), var(--x-shadow);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Windowbar = styled.div`
  height: 18px;
  margin-bottom: 2px;
  padding: 2px;
  display: flex;
  gap: 10px;
  box-shadow: none;
  background: rgb(0, 14, 122);
  color: White;
  font-size: 1em;
  cursor: default;
`;

const FirstLogin: React.FC = () => {
  return (
    <>
      <StyledWindow>
        <Windowbar>
          <img
            width="16"
            height="16"
            src={require("../../images/monitor.png")}
            alt="Monitor"
          />
          Welcome to Trancendence95
        </Windowbar>
        <Container>
        <p>
          Looks like its you first time here.<br /><br />
          You can setup you own name and own Avatar.<br />
          Default will be you intraname and intra Picture.
        </p>
          <WindowWrapper title="change name" titlebottom="62px">
            <NameChangeSection />
          </WindowWrapper>
          <WindowWrapper title="change avatar" titlebottom="65px">
            <AvatarChangeSection />
          </WindowWrapper>
          <TwoFactorAuthSection />
        <p>You can also set it up later.</p>
          <Link to={"/Home"}>
            <Button>Continue</Button>
          </Link>
        </Container>
      </StyledWindow>
    </>
  );
};
export default FirstLogin;
