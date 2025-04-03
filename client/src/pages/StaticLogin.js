import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStaticAuth } from '../context/StaticAuthContext';

const StaticLogin = () => {
  const { t } = useTranslation();
  const { login, error, loading, clearError } = useStaticAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formError, setFormError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (formError) setFormError(null);
    if (error) clearError();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password');
      return;
    }
    
    // Attempt login
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      // Error will be displayed through context
      console.log('Login failed:', result.error);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{t('login')}</h2>
        
        {(error || formError) && (
          <div className="error-message">
            {error || formError}
            <button onClick={() => {
              if (error) clearError();
              if (formError) setFormError(null);
            }} className="close-btn">×</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">{t('email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('enterEmail')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('enterPassword')}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? t('loggingIn') : t('login')}
          </button>
        </form>
        
        <div className="test-accounts">
          <h3>{t('testAccounts')}</h3>
          <div className="test-account">
            <p><strong>Admin:</strong> admin@odocs.devapp.cc / admin123</p>
          </div>
          <div className="test-account">
            <p><strong>Staff:</strong> staff@odocs.devapp.cc / admin123</p>
          </div>
          <div className="test-account">
            <p><strong>Student:</strong> student@odocs.devapp.cc / admin123</p>
          </div>
          <div className="test-account">
            <p><strong>Approver:</strong> advisor@odocs.devapp.cc / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticLogin;