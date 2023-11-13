import React, { useContext, useEffect, useState } from "react";
import { AuthContext, IAuthContext, IUser } from "../context/auth";
import { SocketContext, awSocket } from "../context/socket";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth: IAuthContext = useContext(AuthContext);
  const [isValid, setValidity] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async (): Promise<void> => {
      try {
        const response: Response = await fetch(
          "http://localhost:4000/auth/validate-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: IUser = await response.json();

        if (data) {
          auth.logIn(data);
          setValidity(true);
        } else {
          setValidity(false);
        }
      } catch (error) {
        setValidity(false);
      }
    };
    validateToken();
  }, [auth]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }
  if (!isValid) {
    return <Navigate to="/login" />;
  }
  return (
    <AuthContext.Provider value={auth}>
      <SocketContext.Provider value={awSocket}>
        {children}
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
};

export default PrivateRoute;
