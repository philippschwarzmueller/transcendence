import React from "react";
import NameChangeSection from "../changename/ChangeName";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";
import styled from "styled-components";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import { Link } from "react-router-dom";
import Button from "../button/Button";

const StyledImg = styled.img`
  max-height: 300px;
  max-width: 300px;
  box-shadow:
    rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset,
    rgb(0, 0, 0) 1px 2px 1px 1px;
`;

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
          <div>
            <StyledImg src="https://i.kym-cdn.com/editorials/icons/mobile/000/004/391/Hello_there.jpg" />
          </div>
          <div>
            <p>
              It looks like it's your first time here You can now change your
              name, set a new profile picture or enabled 2FA Don't worry, you
              can set up this stuff later as well
            </p>
          </div>
          <NameChangeSection />
          <AvatarChangeSection />
          <TwoFactorAuthSection />
          <Link to={"/Home"}>
            <Button>Continue</Button>
          </Link>
        </Windowbar>
      </StyledWindow>
    </>
  );
};
export default FirstLogin;
