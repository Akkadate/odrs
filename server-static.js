/**
 * Simple static server for the ODRS application
 * This is used as a fallback when the main server fails to start
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

// Create a simple route for testing
app.get('/api/status', (req, res) => {
  console.log('API status endpoint hit');
  res.json({ 
    status: 'success',
    message: 'ODRS API is running (static mode)',
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
    mode: 'static'
  });
});

// Add a login endpoint for testing
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  // Check if the email and password match any of our test accounts
  if (email && email.includes('@odocs.devapp.cc') && password === 'admin123') {
    console.log('Login successful for:', email);
    
    // Determine role based on email prefix
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
    } else if (email.includes('department_head')) {
      role = 'approver';
      approverLevel = 'department_head';
      firstName = 'Department';
      lastName = 'Head';
    } else if (email.includes('dean')) {
      role = 'approver';
      approverLevel = 'dean';
      firstName = 'Dean';
    }
    
    res.json({
      status: 'success',
      token: 'test-token-' + Date.now(),
      user: {
        id: 'test-user-id',
        email,
        firstName,
        lastName,
        role,
        approverLevel
      }
    });
  } else {
    console.log('Login failed for:', email);
    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials. Try using one of the test accounts.'
    });
  }
});

// Test route for checking if server is alive
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'ODRS static API test successful',
    serverTime: new Date().toISOString()
  });
});

// Mock authentication route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // In static mode, accept any login with password matching "password"
  if (password === 'password') {
    res.json({
      status: 'success',
      message: 'Login successful (static mode)',
      token: 'static-mode-token',
      user: {
        id: '1',
        email: email || 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      }
    });
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Invalid credentials (static mode)'
    });
  }
});

// Mock documents route
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
const PORT = process.env.PORT || 5002; // Use port 5002
app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
  console.log(`Server is available at http://localhost:${PORT}`);
  if (process.env.DOMAIN) {
    console.log(`or at https://${process.env.DOMAIN}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});