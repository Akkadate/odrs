const express = require('express');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve simple document app
app.use('/document-app', express.static(path.join(__dirname, 'simple-document-app')));

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

// Sample approvals data
let approvals = [];

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
  let status = 'pending_payment';
  let currentApprovalLevel = null;
  
  // If document requires approval, set the initial approval level
  if (documentType.requiresApproval && documentType.approvalLevels && documentType.approvalLevels.length > 0) {
    // Will move to this approval level after payment is confirmed
    currentApprovalLevel = documentType.approvalLevels[0];
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
  
  // Get approval history
  const requestApprovals = approvals.filter(approval => approval.requestId === id);
  
  const responseData = {
    ...request,
    approvals: requestApprovals
  };
  
  res.json({
    status: 'success',
    data: responseData
  });
});

// Update payment status (simplified)
app.post('/api/requests/:id/payment', (req, res) => {
  const { id } = req.params;
  const { paymentReference } = req.body;
  
  // Get user info from auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Find the request
  const request = requests.find(req => req.id === id);
  if (!request) {
    return res.status(404).json({
      status: 'error',
      message: 'Request not found'
    });
  }
  
  // Update payment status
  request.paymentStatus = 'paid';
  request.paymentReference = paymentReference;
  request.paymentDate = new Date().toISOString();
  
  // If approval is required, update status to pending_approval
  if (request.currentApprovalLevel) {
    request.status = 'pending_approval';
  } else {
    request.status = 'processing';
  }
  
  res.json({
    status: 'success',
    data: request
  });
});

// Approve or reject request
app.post('/api/requests/:id/approval', (req, res) => {
  const { id } = req.params;
  const { action, comments } = req.body;
  
  // Get user info from auth header
  const authHeader = req.headers.authorization;
  let userId, userRole, approverLevel;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In this demo, we'll just extract the user info from the query or body
    userId = req.body.userId || req.query.userId;
    userRole = req.body.userRole || req.query.userRole;
    approverLevel = req.body.approverLevel || req.query.approverLevel;
    
    if (userRole !== 'approver' && userRole !== 'admin' && userRole !== 'staff') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to approve requests'
      });
    }
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Find the request
  const request = requests.find(req => req.id === id);
  if (!request) {
    return res.status(404).json({
      status: 'error',
      message: 'Request not found'
    });
  }
  
  // Check if the request is in a state that can be approved
  if (request.status !== 'pending_approval') {
    return res.status(400).json({
      status: 'error',
      message: `Request is in ${request.status} state and cannot be approved or rejected`
    });
  }
  
  // Check if the user is the correct approver for current level
  if (userRole === 'approver' && approverLevel !== request.currentApprovalLevel) {
    return res.status(403).json({
      status: 'error',
      message: `This request needs approval from ${request.currentApprovalLevel}, not ${approverLevel}`
    });
  }
  
  // Create approval record
  const approval = {
    id: 'appr-' + Date.now(),
    requestId: id,
    approverId: userId,
    approverRole: userRole,
    approverLevel: approverLevel,
    action: action, // 'approve' or 'reject'
    comments: comments || '',
    createdAt: new Date().toISOString()
  };
  
  // Add to approvals
  approvals.push(approval);
  
  // Update request status based on action
  if (action === 'approve') {
    // If document has multiple approval levels, find the next one
    if (request.documentTypeId) {
      const documentType = documentTypes.find(dt => dt.id === request.documentTypeId);
      
      if (documentType && documentType.approvalLevels && documentType.approvalLevels.length > 0) {
        const currentLevelIndex = documentType.approvalLevels.indexOf(request.currentApprovalLevel);
        
        if (currentLevelIndex < documentType.approvalLevels.length - 1) {
          // Move to next approval level
          request.currentApprovalLevel = documentType.approvalLevels[currentLevelIndex + 1];
        } else {
          // Last level approved, move to processing
          request.status = 'processing';
          request.currentApprovalLevel = null;
        }
      } else {
        // No approval levels defined, move to processing
        request.status = 'processing';
        request.currentApprovalLevel = null;
      }
    } else {
      // If no document type info, just move to processing
      request.status = 'processing';
      request.currentApprovalLevel = null;
    }
  } else if (action === 'reject') {
    // Reject the request
    request.status = 'rejected';
    request.currentApprovalLevel = null;
  }
  
  res.json({
    status: 'success',
    data: {
      request,
      approval
    }
  });
});

// Get pending approvals for an approver
app.get('/api/approvals/pending', (req, res) => {
  // Get user info from auth header
  const authHeader = req.headers.authorization;
  let approverLevel;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In this demo, we'll just extract the approver level from the query
    approverLevel = req.query.approverLevel;
    
    if (!approverLevel) {
      return res.status(400).json({
        status: 'error',
        message: 'Approver level is required'
      });
    }
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Filter requests that need approval from this approver
  const pendingRequests = requests.filter(req => 
    req.status === 'pending_approval' && 
    req.currentApprovalLevel === approverLevel
  );
  
  res.json({
    status: 'success',
    count: pendingRequests.length,
    data: pendingRequests
  });
});

// Update delivery status for a request
app.post('/api/requests/:id/delivery', (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, deliveryMethod, deliveryNotes, deliveredBy } = req.body;
  
  // Get user info from auth header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Validate user role (only staff and admin can update delivery status)
  const userRole = req.body.userRole || req.query.userRole;
  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to update delivery status'
    });
  }
  
  // Find the request
  const request = requests.find(req => req.id === id);
  if (!request) {
    return res.status(404).json({
      status: 'error',
      message: 'Request not found'
    });
  }
  
  // Check if request is in a valid state for delivery update
  if (request.status !== 'processing' && request.status !== 'completed' && request.status !== 'delivered') {
    return res.status(400).json({
      status: 'error',
      message: `Request is in ${request.status} state and cannot be updated for delivery`
    });
  }
  
  // Update delivery information
  request.deliveryStatus = status;
  request.trackingNumber = trackingNumber;
  request.deliveryUpdatedBy = deliveredBy;
  request.deliveryNotes = deliveryNotes;
  request.deliveryUpdatedAt = new Date().toISOString();
  
  // If marked as delivered, update request status
  if (status === 'delivered') {
    request.status = 'delivered';
    request.deliveredAt = new Date().toISOString();
  } else if (status === 'ready') {
    request.status = 'completed';
    request.completedAt = new Date().toISOString();
  }
  
  res.json({
    status: 'success',
    data: request
  });
});

// Get staff processing queue (documents ready for processing/delivery)
app.get('/api/requests/processing', (req, res) => {
  // Get user info from auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized. Please log in.'
    });
  }
  
  // Validate user role (only staff and admin can view processing queue)
  const userRole = req.query.userRole;
  if (userRole !== 'admin' && userRole !== 'staff') {
    return res.status(403).json({
      status: 'error',
      message: 'You are not authorized to view the processing queue'
    });
  }
  
  // Filter requests in processing and completed state
  const processingRequests = requests.filter(req => 
    req.status === 'processing' || req.status === 'completed'
  );
  
  res.json({
    status: 'success',
    count: processingRequests.length,
    data: processingRequests
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

// Start server with fixed port 5003, ignoring environment variable
const PORT = 5003; // Static server always uses port 5003
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