import Moveablewindow from "../moveablewindow/Moveablewindow";
import NameChangeSection from "../changename/ChangeName";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";
import WindowWrapper from "../outlinecontainer/outlinecontainer";

const Profilesettings: React.FC<{
  setDisplay?: (display: boolean) => void;
  $display: boolean;
  z?: number;
}> = ({ $display, z, setDisplay }) => {
  return (
    <>
      <Moveablewindow
        title="Profile Settings"
        display={$display}
        positionX={286}
        positionY={300}
        positionZ={z}
        setDisplay={setDisplay}
      >
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
