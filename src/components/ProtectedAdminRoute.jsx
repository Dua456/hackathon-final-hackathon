import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();

  return isAdmin ? children : <Navigate to="/login" replace />;
};

export default ProtectedAdminRoute;