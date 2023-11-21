import Input from "../input";
import Button from "../button";
import { IAuthContext } from '../../context/auth';

interface TwoFactorAuthSectionProps {
  twoFaCode: string;
  setTwoFaCode: (code: string) => void;
  handleTwoFaCodeSubmit: () => Promise<void>;
  handle2FAactivate: () => Promise<void>;
  handleTwoFaDeactivate: () => Promise<void>;
  qrcode: string;
  auth: IAuthContext;
}


const TwoFactorAuthSection: React.FC<TwoFactorAuthSectionProps> = ({ twoFaCode, setTwoFaCode, handleTwoFaCodeSubmit, handle2FAactivate, handleTwoFaDeactivate, qrcode, auth }) => (
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

export default TwoFactorAuthSection;

