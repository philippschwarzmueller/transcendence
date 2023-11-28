import React, { useContext, useState } from "react";
import { BACKEND } from "../../routes/SetUser";
import { AuthContext, IUser } from "../../context/auth";
import Moveablewindow from "../moveablewindow/Moveablewindow";
import NameChangeSection from "../changename/ChangeName";
import AvatarChangeSection from "../changeavatar/ChangeAvatar";
import TwoFactorAuthSection from "../twoFaSection/TwoFaSection";

const Profilesettings: React.FC<{ $display: boolean; z?: number }> = ({
  $display,
  z,
}) => {
  const isWhitespaceOrEmpty = (input: string): boolean => {

    return /^\s*$/.test(input);
  };
  const auth = useContext(AuthContext);
  const [newName, setNewName] = useState("");
  const [profileLink, setProfileLink] = useState(`${auth.user.name}`);
  const [qrcode, setQrcode] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");

  const handleNameChange = async (): Promise<void> => {

    if (!isWhitespaceOrEmpty(newName)) {
      try {
        const res: Response = await fetch(`${BACKEND}/auth/change-name`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newName }),
          credentials: "include",
        });
        const updatedUser: IUser = await res.json();
        if (updatedUser.name !== auth.user.name) {
          auth.logIn(updatedUser);
          if (updatedUser.name !== undefined) {
            setProfileLink(updatedUser.name);
            alert(`Name changed to '${newName}'`);
            setNewName("");
          }
        } else {
          alert("Name already exists, pick another one");
          setNewName("");
        }
      } catch {
        console.error("error");
      }
    }
  };

  const handleTwoFaCodeSubmit = async (): Promise<void> => {
    if (!isWhitespaceOrEmpty(twoFaCode)) {
      try {
        const res: Response = await fetch(`${BACKEND}/twofa/enable-2FA`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ twoFaCode }),
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const verified: boolean = await res.json();
        if (verified) {
          alert("2FA enabled");
          setQrcode("");
          setTwoFaCode("");
          auth.user.twoFAenabled = true;
        } else {
          alert("2FA activation failed, try again");
          setTwoFaCode("");
        }
      } catch {
        console.error("error");
      }
    }
  };

  const handle2FAactivate = async (): Promise<void> => {
    const response = await fetch(`${BACKEND}/twofa/get-2FA-qrcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const qrImage = await response.text();
    setQrcode(qrImage);
  };

  const handleTwoFaDeactivate = async (): Promise<void> => {
    const response = await fetch(`${BACKEND}/twofa/disable-2FA`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const deactivated: boolean = await response.json();
    if (deactivated) {
      auth.user.twoFAenabled = false;
      alert("2FA deactivated");
    } else {
      alert("2FA deactivation failed");
    }
  };
  return (
    <>
      <Moveablewindow title="Profile Settings" display={$display} positionZ={z}>
        <NameChangeSection
          newName={newName}
          setNewName={setNewName}
          handleNameChange={handleNameChange}
        />
        <h3>Change Avatar</h3>
        <AvatarChangeSection />
        <TwoFactorAuthSection
          twoFaCode={twoFaCode}
          setTwoFaCode={setTwoFaCode}
          handleTwoFaCodeSubmit={handleTwoFaCodeSubmit}
          handle2FAactivate={handle2FAactivate}
          handleTwoFaDeactivate={handleTwoFaDeactivate}
          qrcode={qrcode}
          auth={auth}
        />
      </Moveablewindow>
    </>
  );
};

export default Profilesettings;
