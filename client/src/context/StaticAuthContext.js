import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StaticAuthContext = createContext();

export const StaticAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setError(null);
        } catch (err) {
          console.error('Error parsing stored user:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setError('Session error. Please login again.');
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      
      if (response.data.status === 'success') {
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(token);
        setUser(user);
        setError(null);
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <StaticAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </StaticAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useStaticAuth = () => useContext(StaticAuthContext);

export default StaticAuthContext;