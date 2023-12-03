import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext, IAuthContext, IUser } from "../context/auth";
import FirstLogin from "../components/firstlogin/FirstLogin";
import TwoFaLogin from "../components/twofalogin/TwoFaLogin";

export const BACKEND: string = `http://${window.location.hostname}:${4000}`;

const SetUser: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState<boolean>(false);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(true);
  const [user, setUser] = useState<IUser>();
  const auth = useContext<IAuthContext>(AuthContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(location.search);
      const hashedToken: string | null = urlParams.get("hashedToken");
      setIsFirstLogin(urlParams.get("firstSignIn") === "true");
      if (hashedToken) {
        await fetch(`${BACKEND}/users/get-user-with-token`, {
          method: "POST",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((resUser) => {
            setUser(resUser);
            if (!resUser.twoFAenabled) {
              auth.logIn({
                id: Number(resUser.id),
                name: resUser.name,
                intraname: resUser.intraname,
                twoFAenabled: resUser.twoFAenabled,
                profilePictureUrl: resUser.profilePictureUrl,
                activeChats: resUser.activeChats,
                hasCustomAvatar: resUser.hasCustomAvatar,
                customAvatar: resUser.customAvatar,
              });
              if (!isFirstLogin) {
                setRedirect(true);
              }
            }
          })
          .catch((err) => console.error(err));
        setIsLoading(false);
      }
    };
    fetchData();
  }, [auth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (redirect) {
      nav(`/home`);
    }
  }, [redirect]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <div></div>;
  }

  return (
    <>
      {user?.twoFAenabled && (
        <TwoFaLogin setRedirect={setRedirect} user={user} />
      )}
      {isFirstLogin && <FirstLogin />}
    </>
  );
};

export default SetUser;
