import React from "react";
import TwoFactorAuthSection from "../components/twoFaSection";
import AvatarChangeSection from "../components/changeavatar/ChangeAvatar";
import Taskbar from "../components/taskbar/Taskbar";

const ProfileSettings: React.FC = () => {
  return (
    <>
      <Taskbar />
      <h1>Profile Settings</h1>
      <h3>Change Avatar</h3>
      <AvatarChangeSection />
      <TwoFactorAuthSection />
    </>
  );
};

export default ProfileSettings;
