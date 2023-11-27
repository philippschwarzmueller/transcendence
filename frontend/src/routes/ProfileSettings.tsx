import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext, IAuthContext, IUser } from "../context/auth";
import NameChangeSection from "../components/changename";
import TwoFactorAuthSection from "../components/twoFaSection";
import Button from "../components/button/Button";
import AvatarChangeSection from "../components/changeavatar/ChangeAvatar";
import Taskbar from "../components/taskbar/Taskbar";

const ProfileSettings: React.FC = () => {
  const auth: IAuthContext = useContext(AuthContext);
  const [profileLink] = useState(`${auth.user.name}`);

  return (
    <>
      <Taskbar />
      <h1>Profile Settings</h1>
      <NameChangeSection auth={auth} />
      <h3>Change Avatar</h3>
      <AvatarChangeSection />
      <TwoFactorAuthSection />
      <Link to={`/profile/${profileLink}`}>
        <Button>Back to Profile</Button>
      </Link>
    </>
  );
};

export default ProfileSettings;
