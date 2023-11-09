import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = useContext(AuthContext);

  if (auth.user.name === undefined) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
