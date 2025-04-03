import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStaticAuth } from '../../context/StaticAuthContext';

const StaticLayout = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useStaticAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {isAuthenticated && (
        <header className="app-header">
          <div className="header-logo">ODRS</div>
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/requests">{t('myRequests')}</Link>
              </li>
              <li>
                <Link to="/requests/new">{t('newRequest')}</Link>
              </li>
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin">{t('adminPanel')}</Link>
                </li>
              )}
              {user?.role === 'staff' && (
                <li>
                  <Link to="/staff">{t('manageRequests')}</Link>
                </li>
              )}
              {user?.role === 'approver' && (
                <li>
                  <Link to="/approver">{t('pendingApprovals')}</Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="user-actions">
            <div className="user-info">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              {t('logout')}
            </button>
          </div>
        </header>
      )}
      
      <main className="app-content">
        <Outlet />
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 ODRS - Online Document Request System</p>
        </div>
      </footer>
    </div>
  );
};

export default StaticLayout;