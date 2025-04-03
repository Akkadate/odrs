import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStaticAuth } from './context/StaticAuthContext';
import { useTranslation } from 'react-i18next';

// Pages and Components
import StaticLogin from './pages/StaticLogin';
import StaticLayout from './components/layout/StaticLayout';
import RequestList from './components/requests/RequestList';
import RequestForm from './components/requests/RequestForm';
import RequestDetails from './components/requests/RequestDetails';

// CSS
import './components/requests/RequestStyles.css';
import './styles/AppStyles.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useStaticAuth();
  const { t } = useTranslation();
  
  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function StaticApp() {
  const { isAuthenticated } = useStaticAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <StaticLogin /> : <Navigate to="/requests" />} />
      
      <Route path="/" element={<StaticLayout />}>
        <Route path="requests" element={
          <ProtectedRoute>
            <RequestList />
          </ProtectedRoute>
        } />
        <Route path="requests/new" element={
          <ProtectedRoute>
            <RequestForm />
          </ProtectedRoute>
        } />
        <Route path="requests/:id" element={
          <ProtectedRoute>
            <RequestDetails />
          </ProtectedRoute>
        } />
        <Route index element={isAuthenticated ? <Navigate to="/requests" /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

export default StaticApp;