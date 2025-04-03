import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContext } from './context/ThemeContext';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';
import ApproverRoute from './components/routing/ApproverRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import Payment from './pages/Payment';
import RequestHistory from './pages/RequestHistory';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRequests from './pages/admin/Requests';
import AdminUsers from './pages/admin/Users';
import AdminDocumentTypes from './pages/admin/DocumentTypes';
import AdminReports from './pages/admin/Reports';
import ApproverDashboard from './pages/approver/Dashboard';
import ApproverRequests from './pages/approver/Requests';
import ApproverDetail from './pages/approver/RequestDetail';
import NotFound from './pages/NotFound';

function App() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* Protected routes - all users */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="new-request" element={<NewRequest />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="payment/:id" element={<Payment />} />
            <Route path="history" element={<RequestHistory />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/requests" element={<AdminRequests />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/document-types" element={<AdminDocumentTypes />} />
            <Route path="admin/reports" element={<AdminReports />} />
          </Route>

          {/* Approver routes */}
          <Route element={<ApproverRoute />}>
            <Route path="approver/dashboard" element={<ApproverDashboard />} />
            <Route path="approver/requests" element={<ApproverRequests />} />
            <Route path="approver/requests/:id" element={<ApproverDetail />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MuiThemeProvider>
  );
}

export default App;