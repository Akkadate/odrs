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

// Sample document types data
const documentTypes = [
  {
    id: '1',
    name: 'ใบรับรองการเป็นนักศึกษา',
    nameEn: 'Student Status Certificate',
    description: 'เอกสารรับรองสถานะการเป็นนักศึกษาปัจจุบัน',
    descriptionEn: 'Certificate confirming current student status',
    price: 50,
    requiresApproval: false,
    approvalLevels: null,
    processingTime: 3,
    isActive: true
  },
  {
    id: '2',
    name: 'ใบแสดงผลการเรียน (Transcript)',
    nameEn: 'Transcript',
    description: 'เอกสารแสดงผลการเรียนตลอดหลักสูตร',
    descriptionEn: 'Document showing all course grades',
    price: 100,
    requiresApproval: false,
    approvalLevels: null,
    processingTime: 5,
    isActive: true
  },
  {
    id: '3',
    name: 'ใบรับรองการสำเร็จการศึกษา',
    nameEn: 'Graduation Certificate',
    description: 'เอกสารรับรองการสำเร็จการศึกษา',
    descriptionEn: 'Certificate confirming graduation',
    price: 200,
    requiresApproval: true,
    approvalLevels: ['advisor', 'department_head', 'dean', 'registrar'],
    processingTime: 10,
    isActive: true
  },
  {
    id: '4',
    name: 'ใบรับรองเกรดเฉลี่ย',
    nameEn: 'GPA Certificate',
    description: 'เอกสารรับรองเกรดเฉลี่ยสะสม',
    descriptionEn: 'Certificate confirming cumulative GPA',
    price: 80,
    requiresApproval: false,
    approvalLevels: null,
    processingTime: 3,
    isActive: true
  },
  {
    id: '5',
    name: 'ใบรับรองสำหรับเงินกู้ กยศ.',
    nameEn: 'Student Loan Certificate',
    description: 'เอกสารรับรองสำหรับการกู้ยืมเงินจากกองทุน กยศ.',
    descriptionEn: 'Certificate for student loan applications',
    price: 50,
    requiresApproval: true,
    approvalLevels: ['advisor', 'department_head'],
    processingTime: 7,
    isActive: true
  }
];

// Sample requests data
let requests = [];

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
        id: 'user-' + Date.now(),
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

// Document types API
app.get('/api/documents', (req, res) => {
  // Return only active document types to regular users
  const activeDocuments = documentTypes.filter(doc => doc.isActive);
  res.json({
    status: 'success',
    data: activeDocuments
  });
});

// Get a single document type
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const documentType = documentTypes.find(doc => doc.id === id);
  
  if (!documentType) {
    return res.status(404).json({
      status: 'error',
      message: 'Document type not found'
    });
  }
  
  res.json({
    status: 'success',
    data: documentType
  });
});

// Create a new request
app.post('/api/requests', (req, res) => {
  // Extract request data
  const { documentTypeId, quantity, language, deliveryMethod, deliveryAddress } = req.body;
  
  // Get user info from auth header
  const authHeader = req.headers.authorization;
  let userId, userEmail, userRole;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // This is a simplified auth check - in a real app, you'd verify the token
    const token = authHeader.split(' ')[1];
    // In this demo, we'll just extract the user info from the request
    userId = req.body.userId || 'user-12345';
    userEmail = req.body.userEmail || 'student@odocs.devapp.cc';
    userRole = req.body.userRole || 'student';
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Validate required fields
  if (!documentTypeId || !quantity || !language || !deliveryMethod) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all required fields'
    });
  }
  
  // Validate delivery address for mail delivery
  if (deliveryMethod === 'mail' && !deliveryAddress) {
    return res.status(400).json({
      status: 'error',
      message: 'Delivery address is required for mail delivery'
    });
  }
  
  // Find the document type
  const documentType = documentTypes.find(doc => doc.id === documentTypeId);
  if (!documentType) {
    return res.status(404).json({
      status: 'error',
      message: 'Document type not found'
    });
  }
  
  // Calculate price
  let totalPrice = documentType.price * quantity;
  let shippingFee = 0;
  
  if (deliveryMethod === 'mail') {
    shippingFee = 50; // Standard shipping fee
    totalPrice += shippingFee;
  }
  
  // Determine initial status based on document type
  let status, currentApprovalLevel;
  if (!documentType.requiresApproval) {
    status = 'pending_payment';
    currentApprovalLevel = null;
  } else {
    status = 'pending_payment'; // Will move to pending_approval after payment
    currentApprovalLevel = documentType.approvalLevels ? documentType.approvalLevels[0] : null;
  }
  
  // Generate a request number
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const requestNumber = `REQ-${timestamp}-${random}`;
  
  // Create the request
  const newRequest = {
    id: 'req-' + Date.now(),
    requestNumber,
    userId,
    userEmail,
    documentTypeId,
    documentTypeName: documentType.name,
    documentTypeNameEn: documentType.nameEn,
    quantity,
    language,
    deliveryMethod,
    deliveryAddress,
    totalPrice,
    shippingFee,
    status,
    paymentStatus: 'unpaid',
    currentApprovalLevel,
    createdAt: new Date().toISOString(),
    estimatedCompletionDate: new Date(Date.now() + (documentType.processingTime || 3) * 24 * 60 * 60 * 1000).toISOString()
  };
  
  // Add to our in-memory store
  requests.push(newRequest);
  
  res.status(201).json({
    status: 'success',
    data: newRequest
  });
});

// Get all requests for the current user
app.get('/api/requests', (req, res) => {
  // Get user info from auth header - this is simplified
  const authHeader = req.headers.authorization;
  let userId, userRole;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In this demo, we'll just extract the user info from the query
    userId = req.query.userId || 'user-12345';
    userRole = req.query.userRole || 'student';
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Filter requests based on user role
  let userRequests;
  if (userRole === 'admin' || userRole === 'staff') {
    // Admins and staff can see all requests
    userRequests = requests;
  } else if (userRole === 'approver') {
    // Approvers see requests that need their approval
    const approverLevel = req.query.approverLevel;
    userRequests = requests.filter(req => 
      req.currentApprovalLevel === approverLevel && 
      req.status === 'pending_approval');
  } else {
    // Students see only their requests
    userRequests = requests.filter(req => req.userId === userId);
  }
  
  res.json({
    status: 'success',
    count: userRequests.length,
    data: userRequests
  });
});

// Get a single request
app.get('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const request = requests.find(req => req.id === id);
  
  if (!request) {
    return res.status(404).json({
      status: 'error',
      message: 'Request not found'
    });
  }
  
  // Get user info from auth header - this is simplified
  const authHeader = req.headers.authorization;
  let userId, userRole;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In this demo, we'll just extract the user info from the query
    userId = req.query.userId;
    userRole = req.query.userRole;
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Check authorization
  if (userRole !== 'admin' && userRole !== 'staff' && 
      !(userRole === 'approver' && request.currentApprovalLevel === req.query.approverLevel) &&
      request.userId !== userId) {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to view this request'
    });
  }
  
  res.json({
    status: 'success',
    data: request
  });
});

// React app routes - serve fallback for react app routes
app.get('/requests/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/fallback.html'));
});

app.get('/requests', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/fallback.html'));
});

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/fallback.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/fallback.html'));
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

// Start server with fixed port 5002, ignoring environment variable
const PORT = 5002; // Static server always uses port 5002
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