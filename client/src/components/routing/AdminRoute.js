import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Allow admin and staff roles to access admin routes
  return isAuthenticated && (user?.role === 'admin' || user?.role === 'staff') ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default AdminRoute;