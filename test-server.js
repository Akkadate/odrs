/**
 * ODRS Test Server
 * This is a simplified server that includes login functionality
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API Status route
app.get('/api/status', (req, res) => {
  console.log('API status endpoint hit');
  res.json({ 
    status: 'success',
    message: 'ODRS Test Server is running',
    time: new Date().toISOString()
  });
});

// Special login endpoint for testing
app.post('/api/auth/test-login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt received:', { email });
  
  // Determine role based on email prefix
  let role = 'student';
  let approverLevel = null;
  let firstName = email.split('@')[0];
  let lastName = 'Test';
  
  if (email.includes('admin')) {
    role = 'admin';
    firstName = 'Admin';
  } else if (email.includes('staff')) {
    role = 'staff';
    firstName = 'Staff';
  } else if (email.includes('advisor')) {
    role = 'approver';
    approverLevel = 'advisor';
    firstName = 'Advisor';
  } else if (email.includes('department_head')) {
    role = 'approver';
    approverLevel = 'department_head';
    firstName = 'Department';
    lastName = 'Head';
  } else if (email.includes('dean')) {
    role = 'approver';
    approverLevel = 'dean';
    firstName = 'Dean';
  } else if (email.includes('registrar')) {
    role = 'approver';
    approverLevel = 'registrar';
    firstName = 'Registrar';
  }
  
  // Send success response
  res.json({
    status: 'success',
    token: 'test-token-' + Date.now(),
    user: {
      id: 'test-user-id-' + Date.now(),
      email,
      firstName,
      lastName,
      role,
      approverLevel
    }
  });
});

// Use the test-login endpoint for regular login requests too
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Regular login request, redirecting to test-login:', { email });
  
  if (email.includes('@odocs.devapp.cc') && password === 'admin123') {
    // Extract role and name from email
    let role = 'student';
    let approverLevel = null;
    let firstName = email.split('@')[0];
    let lastName = 'User';
    
    if (email.includes('admin')) {
      role = 'admin';
      firstName = 'Admin';
    } else if (email.includes('staff')) {
      role = 'staff';
      firstName = 'Staff';
    } else if (email.includes('advisor')) {
      role = 'approver';
      approverLevel = 'advisor';
      firstName = 'Advisor';
    }
    
    return res.json({
      status: 'success',
      token: 'test-token-' + Date.now(),
      user: {
        id: 'test-user-id-' + Date.now(),
        email,
        firstName,
        lastName,
        role,
        approverLevel
      }
    });
  }
  
  // Return error for non-matching credentials
  return res.status(401).json({
    status: 'error',
    message: 'Invalid credentials. Try using one of the test accounts.'
  });
});

// Document types route
app.get('/api/documents', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        id: '1',
        name: 'ใบรับรองการเป็นนักศึกษา',
        nameEn: 'Student Status Certificate',
        price: 50,
        processingTime: 3
      },
      {
        id: '2',
        name: 'ใบแสดงผลการเรียน (Transcript)',
        nameEn: 'Transcript',
        price: 100,
        processingTime: 5
      },
      {
        id: '3',
        name: 'ใบรับรองการสำเร็จการศึกษา',
        nameEn: 'Graduation Certificate',
        price: 200,
        processingTime: 10
      }
    ]
  });
});

// Any other route should serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = 5003; // Use a different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Server is available at http://localhost:${PORT}`);
  console.log(`or at http://147.50.10.29:${PORT}`);
});