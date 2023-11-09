import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isValid, setValidity] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch("http://localhost:4000/auth/validate-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

				console.log(data);
        if (data) {
          auth.logIn(data.name);
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
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
