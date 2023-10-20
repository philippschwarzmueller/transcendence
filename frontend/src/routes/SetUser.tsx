import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth";
import { IUser } from "../routes/Profile";

const SetUser: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);
  let [user, setUser] = useState<IUser>();

  let auth = useContext(AuthContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const userName: string | null = urlParams.get("user");
    if (userName) {
      fetch(`http://localhost:4000/users/${userName}`)
        .then((res) => res.json())
        .then((resUser) => {
          setUser(resUser);
          console.log(resUser);
          auth.logIn({
            id: Number(resUser.id),
            name: resUser.name,
            image: resUser.profilePictureUrl,
          });
          setRedirect(true);
        });
    }
  }, [location.search, redirect, auth]);

  useEffect(() => {
    if (redirect) {
      nav(`/profile/${user?.name}`);
    }
  }, [nav, redirect]);

  return null;
};

export default SetUser;
