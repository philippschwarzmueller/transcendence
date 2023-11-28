import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext, IUser } from "../context/auth";
import TwoFaLogin from "../components/twofalogin/TwoFaLogin";

export const BACKEND: string = `http://${window.location.hostname}:${4000}`;

const SetUser: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);
  const [user, setUser] = useState<IUser>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userName: string | null = urlParams.get("user");
    if (userName) {
      fetch(`${BACKEND}/users/${userName}`)
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
            });
            setRedirect(true);
          }
        })
        .catch((err) => console.error(err));
    }
    setIsLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (redirect) {
      nav(`/test`); //TODO change later for login redirect
    }
  }, [redirect]);

  if(isLoading){
    return(
      <div>Loading</div>
    )
  }

  return (
    <>
      {user?.twoFAenabled && <TwoFaLogin setRedirect={setRedirect} user={user}/>}
    </>
  );
};

export default SetUser;
