import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Link as MuiLink, 
  Alert,
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const { t } = useTranslation();
  const { login, loading, error, clearErrors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Formik setup for form handling
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t('invalidEmail'))
        .required(t('requiredField')),
      password: Yup.string()
        .required(t('requiredField'))
    }),
    onSubmit: async (values) => {
      clearErrors();
      setLoginError(null);
      
      const result = await login(values.email, values.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setLoginError(result.error);
      }
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            {t('login')}
          </Typography>
          
          {(error || loginError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError || error}
            </Alert>
          )}
          
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label={t('email')}
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            
            <TextField
              fullWidth
              id="password"
              name="password"
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <MuiLink 
                component={Link} 
                to="/forgot-password" 
                variant="body2"
              >
                {t('forgotPassword')}
              </MuiLink>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('login')}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                {t('dontHaveAccount')}{' '}
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  variant="body2"
                >
                  {t('register')}
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;