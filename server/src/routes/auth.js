const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Debug middleware for ALL auth routes
router.use((req, res, next) => {
  console.log('===== AUTH REQUEST =====');
  console.log('Route:', req.path);
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('========================');
  next();
});

// Test login endpoint that accepts any credentials (FOR DEVELOPMENT ONLY)
router.post('/test-login', (req, res) => {
  const { email, password } = req.body;
  console.log('Test login successful for:', email);
  
  // Determine role based on email prefix
  let role = 'student';
  let approverLevel = null;
  
  if (email.includes('admin')) {
    role = 'admin';
  } else if (email.includes('staff')) {
    role = 'staff';
  } else if (email.includes('advisor')) {
    role = 'approver';
    approverLevel = 'advisor';
  } else if (email.includes('department_head')) {
    role = 'approver';
    approverLevel = 'department_head';
  } else if (email.includes('dean')) {
    role = 'approver';
    approverLevel = 'dean';
  } else if (email.includes('registrar')) {
    role = 'approver';
    approverLevel = 'registrar';
  }
  
  res.json({
    status: 'success',
    token: 'test-token-' + Date.now(),
    user: {
      id: 'test-user-id',
      email,
      firstName: email.split('@')[0],
      lastName: 'Test',
      role,
      approverLevel
    }
  });
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;