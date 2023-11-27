import Input from "../input";
import Button from "../button";
import { AuthContext, IAuthContext } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";
import { useContext, useState } from "react";

const TwoFactorAuthSection: React.FC = () => {
  const isWhitespaceOrEmpty = (input: string): boolean => {
    return /^\s*$/.test(input);
  };
  const auth: IAuthContext = useContext(AuthContext);
  const [qrcode, setQrcode] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");

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
    <div>
      {!qrcode && !auth.user.twoFAenabled && (
        <Button onClick={handle2FAactivate}>Enable 2FA</Button>
      )}
      {qrcode && (
        <>
          <img src={qrcode} alt="QR Code" />
          <Input
            label="2FA code"
            placeholder="Enter 2FA code here"
            value={twoFaCode}
            onChange={(e) => setTwoFaCode(e.target.value)}
          />
          <Button onClick={handleTwoFaCodeSubmit}>Submit 2FA Code</Button>
        </>
      )}
      {auth.user.twoFAenabled && (
        <Button onClick={handleTwoFaDeactivate}>Disable 2FA</Button>
      )}
    </div>
  );
};

export default TwoFactorAuthSection;
