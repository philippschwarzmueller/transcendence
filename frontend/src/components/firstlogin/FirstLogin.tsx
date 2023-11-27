import React, { useContext, useState } from "react";
import NameChangeSection from "../changename/ChangeName";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";
import styled from "styled-components";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import { AuthContext, IAuthContext } from "../../context/auth";
import { Link } from "react-router-dom";
import Button from "../button/Button";

const StyledImg = styled.img`
  max-height: 300px;
  max-width: 300px;
  box-shadow: rgb(255, 255, 255) 1px 1px 0px 1px inset,
    rgb(134, 138, 142) 0px 0px 0px 1px inset, rgb(0, 0, 0) 1px 2px 1px 1px;
`;

const FirstLogin: React.FC = () => {
  const auth: IAuthContext = useContext(AuthContext);
  const [profileLink, setProfileLink] = useState(`${auth.user.name}`);

  return (
    <>
      <div>
        <StyledImg src="https://i.kym-cdn.com/editorials/icons/mobile/000/004/391/Hello_there.jpg" />
      </div>
      <div>
        <p>
          It looks like it's your first time here You can now change your name,
          set a new profile picture or enabled 2FA Don't worry, you can set up
          this stuff later as well
        </p>
      </div>
      <NameChangeSection setProfileLink={setProfileLink}/>
      <AvatarChangeSection />
      <TwoFactorAuthSection />
      <Link to={`/profile/${profileLink}`}>
        <Button>Continue to your profile</Button>
      </Link>
    </>
  );
};
export default FirstLogin;
