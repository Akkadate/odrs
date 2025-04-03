import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ApproverRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Only allow users with approver role to access approver routes
  return isAuthenticated && user?.role === 'approver' ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default ApproverRoute;