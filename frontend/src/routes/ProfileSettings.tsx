import React, { useEffect } from "react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/button";
import { AuthContext, IUser } from "../context/auth";
import Input from "../components/input";

const ProfileSettings: React.FC = () => {
  const auth = useContext(AuthContext);
  const BACKEND: string = `http://${window.location.hostname}:${4000}`;
  const [newName, setNewName] = useState("");
  const [profileLink, setProfileLink] = useState(`${auth.user.name}`);
  const [qrcode, setQrcode] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");

  const isWhitespaceOrEmpty = (input: string): boolean => {
    return /^\s*$/.test(input);
  };

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
        console.log("error");
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
        } else {
          alert("2FA activation failed, try again");
          setTwoFaCode("");
        }
      } catch {
        console.log("error");
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

  const handleNewNameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewName(e.target.value);
  };

  const handleTwoFaCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTwoFaCode(e.target.value);
  };

  return (
    <>
      <h1>Profile Settings</h1>
      <Input
        label="New profile name"
        placeholder="new name goes here"
        value={newName}
        onChange={handleNewNameInputChange}
      />
      <Button onClick={handleNameChange}>Change Name</Button>
      <h3>Change Avatar</h3>
      <div>
        {!auth.user.twoFAenabled && (
          <Button onClick={handle2FAactivate}>Enable 2FA</Button>
        )}
        <div>{qrcode && <img src={qrcode} alt="QR Code" />}</div>
        <div>
          {qrcode && (
            <Input
              label="2FA code"
              placeholder="Enter 2FA code here"
              value={twoFaCode}
              onChange={handleTwoFaCodeInputChange}
            ></Input>
          )}
        </div>
        <div>
          {qrcode && (
            <Button onClick={handleTwoFaCodeSubmit}>Submit 2FA Code</Button>
          )}
        </div>
        <div>
          {auth.user.twoFAenabled && (
            <Button onClick={handleTwoFaDeactivate}>Disable 2FA</Button>
          )}
        </div>
      </div>
      <Link to={`/profile/${profileLink}`}>
        <Button>Back to Profile</Button>
      </Link>
    </>
  );
};

export default ProfileSettings;
