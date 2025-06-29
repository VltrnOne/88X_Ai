import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    // If no token exists, redirect the user to the /login page
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;