import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        
        setUser(res.data.data);
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setError(err.response?.data?.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    navigate('/login');
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await api.put('/users/profile', userData);
      
      setUser(res.data.data);
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Profile update failed');
      return { success: false, error: err.response?.data?.message || 'Profile update failed' };
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      await api.put('/auth/updatepassword', passwordData);
      
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password update failed');
      return { success: false, error: err.response?.data?.message || 'Password update failed' };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await api.post('/auth/forgotpassword', { email });
      
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to send password reset email');
      return { success: false, error: err.response?.data?.message || 'Failed to send password reset email' };
    }
  };

  // Reset password
  const resetPassword = async (password, token) => {
    try {
      setLoading(true);
      await api.put(`/auth/resetpassword/${token}`, { password });
      
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset failed');
      return { success: false, error: err.response?.data?.message || 'Password reset failed' };
    }
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;