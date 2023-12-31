import React, { useContext, useEffect, useState } from "react";
import { AuthContext, IAuthContext, IUser } from "../context/auth";
import { Navigate } from "react-router-dom";
import { BACKEND } from "./SetUser";

interface PrivateRouteProps {
  children: JSX.Element;
}

export const validateToken = async (auth: IAuthContext): Promise<boolean> => {
  try {
    const response: Response = await fetch(`${BACKEND}/auth/validate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: IUser = await response.json();

    if (data) {
      if (!auth.user.intraname) {
        auth.logIn(data);
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth: IAuthContext = useContext(AuthContext);
  const [isValid, setValidity] = useState<boolean | null>(null);

  useEffect(() => {
    validateToken(auth).then((res) => {
      setValidity(res);
    });
  }, [auth]);

  if (isValid === null) {
    return <div></div>;
  } else if (!isValid) {
    return <Navigate to="/login" />;
  } else {
    return children;
  }
};

export default PrivateRoute;
