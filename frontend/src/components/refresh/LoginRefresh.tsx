import React, { useContext, useEffect } from "react";
import { AuthContext, IAuthContext } from "../../context/auth";
import { validateToken } from "../../routes/PrivateRoute";

interface LoginRefreshProps {
  children: JSX.Element;
}

const LoginRefresh: React.FC<LoginRefreshProps> = ({ children }) => {
  const auth: IAuthContext = useContext(AuthContext);

  useEffect(() => {
    validateToken(auth);
  }, [auth]);

  return <>{children}</>;
};

export default LoginRefresh;
