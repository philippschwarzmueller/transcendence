import Button from "../button";
import Input from "../input";
import { AuthContext, IUser } from "../../context/auth";
import { BACKEND } from "../../routes/SetUser";
import { useContext, useState } from "react";

interface TwoFaLoginProps {
  setRedirect: (redirect: boolean) => void;
  user: IUser;
}

const TwoFaLogin: React.FC<TwoFaLoginProps> = ({ setRedirect, user }) => {
  const auth = useContext(AuthContext);
  const [twoFaCode, setTwoFaCode] = useState("");

  const handleTwoFaCodeSubmit = async (): Promise<void> => {
    try {
      const res: Response = await fetch(`${BACKEND}/twofa/login-2FA`, {
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
      if (verified && user) {
        auth.logIn({
          id: Number(user.id),
          name: user.name,
          intraname: user.intraname,
          twoFAenabled: user.twoFAenabled,
          profilePictureUrl: user.profilePictureUrl,
          activeChats: user.activeChats,
        });
        setRedirect(true);
      } else {
        alert("Wrong 2FA Code");
      }
    } catch {
      console.error("error");
    }
  };

  const handleTwoFaCodeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTwoFaCode(e.target.value);
  };

  return (
    <>
      <Input
        label="2FA code"
        placeholder="Enter 2FA code here"
        value={twoFaCode}
        onChange={handleTwoFaCodeInputChange}
      ></Input>
      <Button onClick={handleTwoFaCodeSubmit}>Submit 2FA Code</Button>
    </>
  );
};

export default TwoFaLogin;
