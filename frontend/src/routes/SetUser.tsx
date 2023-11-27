import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext, IUser } from "../context/auth";
import Input from "../components/input/Input";
import Button from "../components/button";
import FirstLogin from "../components/firstlogin/FirstLogin";

export const BACKEND: string = `http://${window.location.hostname}:${4000}`;

const SetUser: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [user, setUser] = useState<IUser>();
  const auth = useContext(AuthContext);

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
          intraname: user.name,
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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userName: string | null = urlParams.get("user");
    setIsFirstLogin(urlParams.get("firstSignIn") === 'true');
    if (userName) {
      fetch(`${BACKEND}/users/${userName}`)
        .then((res) => res.json())
        .then((resUser) => {
          setUser(resUser);
          if (!resUser.twoFAenabled) {
            auth.logIn({
              id: Number(resUser.id),
              name: resUser.name,
              intraname: resUser.name,
              twoFAenabled: resUser.twoFAenabled,
              profilePictureUrl: resUser.profilePictureUrl,
              activeChats: resUser.activeChats,
            });
            if(!isFirstLogin){
              setRedirect(true);
            }
          }
        });
    }
  }, [location.search, auth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (redirect) {
      console.log(isFirstLogin);
      nav(`/test`); //TODO change later for login redirect
    }
  }, [nav, redirect, user?.name]);

  return (
    <>
      {user?.twoFAenabled && (
        <div>
          <div>
            <Input
              label="2FA code"
              placeholder="Enter 2FA code here"
              value={twoFaCode}
              onChange={handleTwoFaCodeInputChange}
            ></Input>{" "}
          </div>
          <div>
            <Button onClick={handleTwoFaCodeSubmit}>Submit 2FA Code</Button>
          </div>
        </div>
      )}
      {isFirstLogin && <FirstLogin/>}
    </>
  );
};

export default SetUser;
