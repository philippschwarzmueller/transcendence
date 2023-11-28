import Moveablewindow from "../moveablewindow/Moveablewindow";
import NameChangeSection from "../changename/ChangeName";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";

const Profilesettings: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  return (
    <>
      <Moveablewindow title="Profile Settings" display={$display} positionZ={z}>
      <NameChangeSection />
      <h3>Change Avatar</h3>
      <AvatarChangeSection />
      <TwoFactorAuthSection />
      </Moveablewindow>
    </>
  );
};

export default Profilesettings;
