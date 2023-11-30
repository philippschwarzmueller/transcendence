import Moveablewindow from "../moveablewindow/Moveablewindow";
import NameChangeSection from "../changename/ChangeName";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";
import WindowWrapper from "../outlinecontainer/outlinecontainer";

const Profilesettings: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  return (
    <>
      <Moveablewindow title="Profile Settings" display={$display} positionZ={z}>
        <WindowWrapper title="change name">
          <NameChangeSection />
        </WindowWrapper>
        <WindowWrapper title="change avatar">
          <AvatarChangeSection />
        </WindowWrapper>
        <TwoFactorAuthSection />
      </Moveablewindow>
    </>
  );
};

export default Profilesettings;
