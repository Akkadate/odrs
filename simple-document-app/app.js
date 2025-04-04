// ODRS - Online Document Request System
// Main application JavaScript file

// Helper functions for session persistence
const SessionManager = {
  saveUser: function(user, authToken) {
    try {
      localStorage.setItem('odrs_user', JSON.stringify(user));
      localStorage.setItem('odrs_token', authToken);
      console.log('User session saved to localStorage');
      return true;
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
      return false;
    }
  },
  
  getUser: function() {
    try {
      const userData = localStorage.getItem('odrs_user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error('Error retrieving user from localStorage:', e);
      return null;
    }
  },
  
  getToken: function() {
    return localStorage.getItem('odrs_token');
  },
  
  clearSession: function() {
    localStorage.removeItem('odrs_user');
    localStorage.removeItem('odrs_token');
    console.log('User session cleared from localStorage');
  },
  
  isLoggedIn: function() {
    return !!this.getUser() && !!this.getToken();
  }
};

// Global variables
let currentUser = null;
let token = null;
let documentTypes = [];
let notifications = [];
let filteredNotifications = [];

// Document preview variables
let currentDocumentPreview = null;
let documentPreviews = {
  'DOC-20250401-001': {
    preview: '/path/to/sample/preview.pdf',
    type: 'pdf',
    verificationCode: 'ODOC-1234-5678-ABCD'
  },
  'DOC-20250402-003': {
    preview: '/path/to/sample/transcript.jpg',
    type: 'image',
    verificationCode: 'ODOC-9876-5432-WXYZ'
  },
  'DOC-20250403-002': {
    preview: '/path/to/sample/certificate.png',
    type: 'image',
    verificationCode: 'ODOC-2468-1357-EFGH'
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing ODRS application...');
  
  // Set up login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  }
  
  // Initialize document types
  documentTypes = [
    { id: 1, name: 'Transcript', nameEn: 'Transcript', price: 100, processingDays: 3 },
    { id: 2, name: 'ใบรับรองการศึกษา', nameEn: 'Student Status Certificate', price: 50, processingDays: 2 },
    { id: 3, name: 'ใบปริญญาบัตร', nameEn: 'Degree Certificate', price: 200, processingDays: 5 },
    { id: 4, name: 'ใบแทนปริญญาบัตร', nameEn: 'Replacement Degree Certificate', price: 500, processingDays: 10 },
    { id: 5, name: 'ใบรับรองคะแนน', nameEn: 'Grade Certification', price: 100, processingDays: 3 }
  ];
  
  // Populate document type dropdown
  const documentTypeDropdown = document.getElementById('documentTypeId');
  if (documentTypeDropdown) {
    documentTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.id;
      option.textContent = `${type.nameEn} / ${type.name} (฿${type.price})`;
      documentTypeDropdown.appendChild(option);
    });
  }
  
  // Initialize notifications
  notifications = [
    {
      id: 'note-1',
      title: 'Document Request Approved',
      message: 'Your request DOC-20250401-001 has been approved.',
      type: 'success',
      time: '2025-04-02T10:30:00',
      read: false,
      link: { label: 'View Request', action: 'viewRequest', id: 'DOC-20250401-001' }
    },
    {
      id: 'note-2',
      title: 'Payment Verified',
      message: 'Your payment for request DOC-20250402-003 has been verified.',
      type: 'info',
      time: '2025-04-01T14:45:00',
      read: true,
      link: { label: 'View Request', action: 'viewRequest', id: 'DOC-20250402-003' }
    },
    {
      id: 'note-3',
      title: 'Document Ready for Pickup',
      message: 'Your document for request DOC-20250403-002 is ready for pickup.',
      type: 'info',
      time: '2025-03-30T09:15:00',
      read: false,
      link: { label: 'View Request', action: 'viewRequest', id: 'DOC-20250403-002' }
    }
  ];
  
  // Make a copy of notifications for filtering
  filteredNotifications = [...notifications];
  
  // Make sure only login page is shown initially
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.style.display = 'none';
  });
  
  // Check if user is already logged in using SessionManager
  if (SessionManager.isLoggedIn()) {
    try {
      // Restore the user session
      currentUser = SessionManager.getUser();
      token = SessionManager.getToken();
      
      console.log('Found saved session, restoring user:', currentUser.name);
      
      // Update UI
      document.getElementById('user-name').textContent = currentUser.name;
      document.getElementById('user-role').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
      
      // Show/hide role-specific nav items
      if (currentUser.role === 'approver' || currentUser.role === 'admin') {
        document.getElementById('approvals-nav-item').style.display = 'block';
      }
      
      if (currentUser.role === 'staff' || currentUser.role === 'admin') {
        document.getElementById('processing-nav-item').style.display = 'block';
      }
      
      if (currentUser.role === 'admin') {
        document.getElementById('reports-nav-item').style.display = 'block';
      }
      
      // Show requests page instead of login page
      showPage('requests');
      console.log('Restored user session for', currentUser.name);
    } catch (error) {
      console.error('Error restoring user session:', error);
      // If there's an error, show the login page
      document.getElementById('login-page').style.display = 'block';
      
      // Hide role-specific nav items
      document.getElementById('approvals-nav-item').style.display = 'none';
      document.getElementById('processing-nav-item').style.display = 'none';
      document.getElementById('reports-nav-item').style.display = 'none';
    }
  } else {
    // No saved login, show login page
    document.getElementById('login-page').style.display = 'block';
    
    // Hide role-specific nav items until login
    document.getElementById('approvals-nav-item').style.display = 'none';
    document.getElementById('processing-nav-item').style.display = 'none';
    document.getElementById('reports-nav-item').style.display = 'none';
  }
  
  console.log('ODRS application initialized');
});

// Login function
function login(email, password) {
  console.log('Login attempt:', email);
  
  // For demo purposes, we're using hardcoded credentials
  const users = {
    'admin@odocs.devapp.cc': {
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      language: 'en'
    },
    'staff@odocs.devapp.cc': {
      password: 'admin123',
      name: 'Staff User',
      role: 'staff',
      language: 'en'
    },
    'student@odocs.devapp.cc': {
      password: 'admin123',
      name: 'Student User',
      role: 'student',
      language: 'en'
    },
    'advisor@odocs.devapp.cc': {
      password: 'admin123',
      name: 'Advisor User',
      role: 'approver',
      approverLevel: 'advisor',
      language: 'en'
    }
  };
  
  // Initialize notification badge on login
  updateNotificationBadge();
  
  // Check if email exists and password matches
  if (users[email] && users[email].password === password) {
    currentUser = {
      email,
      name: users[email].name,
      role: users[email].role,
      language: users[email].language
    };
    
    // Add approver level if user is an approver
    if (users[email].role === 'approver') {
      currentUser.approverLevel = users[email].approverLevel;
    }
    
    // Generate a fake token
    token = 'fake-token-' + Date.now();
    
    // Save user session using SessionManager
    SessionManager.saveUser(currentUser, token);
    
    // Update UI
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Show/hide role-specific nav items
    if (currentUser.role === 'approver' || currentUser.role === 'admin') {
      document.getElementById('approvals-nav-item').style.display = 'block';
    }
    
    if (currentUser.role === 'staff' || currentUser.role === 'admin') {
      document.getElementById('processing-nav-item').style.display = 'block';
    }
    
    if (currentUser.role === 'admin') {
      document.getElementById('reports-nav-item').style.display = 'block';
    }
    
    // Hide login page, show requests page
    document.getElementById('login-page').style.display = 'none';
    showPage('requests');
    
    console.log('Login successful as', currentUser.role);
    return true;
  } else {
    // Show error message
    document.getElementById('login-error').style.display = 'flex';
    console.log('Login failed');
    return false;
  }
}

// Logout function
function logout() {
  console.log('Logging out...');
  
  // Clear current user and token
  currentUser = null;
  token = null;
  
  // Clear session storage
  SessionManager.clearSession();
  
  // Reset UI
  document.getElementById('user-name').textContent = 'Loading...';
  document.getElementById('user-role').textContent = '';
  
  // Hide role-specific nav items
  document.getElementById('approvals-nav-item').style.display = 'none';
  document.getElementById('processing-nav-item').style.display = 'none';
  document.getElementById('reports-nav-item').style.display = 'none';
  
  // Hide all pages, show login page
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.style.display = 'none';
  });
  document.getElementById('login-page').style.display = 'block';
  
  console.log('Logout complete');
}

// Show specific page and hide others
function showPage(pageName) {
  console.log('Showing page:', pageName);
  
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.style.display = 'none';
  });
  
  // Show requested page
  document.getElementById(`${pageName}-page`).style.display = 'block';
  
  // Update active nav link
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('onclick') === `showPage('${pageName}')`) {
      link.classList.add('active');
    }
  });
  
  // Load page-specific data
  if (pageName === 'requests') {
    loadRequests();
  } else if (pageName === 'approvals') {
    // loadPendingApprovals();
  } else if (pageName === 'processing') {
    // loadProcessingQueue();
  } else if (pageName === 'reports') {
    // loadReports();
  } else if (pageName === 'notifications') {
    // Load notifications
    const currentFilter = document.querySelector('input[name="notification-filter"]:checked').value;
    filterNotifications(currentFilter);
    updateNotificationBadge();
  }
}

// Load requests for the current user
function loadRequests() {
  console.log('Loading requests for current user');
  
  // Sample requests data
  const userRequests = [
    {
      id: 'DOC-20250401-001',
      requestNumber: 'DOC-20250401-001',
      documentTypeId: 3,
      documentTypeName: 'ใบปริญญาบัตร',
      documentTypeNameEn: 'Degree Certificate',
      quantity: 2,
      language: 'thai',
      status: 'completed',
      deliveryMethod: 'pickup',
      createdAt: '2025-04-01T09:30:00',
      totalPrice: 400,
      documentPrice: 400,
      shippingFee: 0,
      paidAt: '2025-04-01T10:45:00',
      approvedAt: '2025-04-01T13:20:00',
      deliveryStatus: 'ready',
      hasPreview: true
    },
    {
      id: 'DOC-20250402-003',
      requestNumber: 'DOC-20250402-003',
      documentTypeId: 1,
      documentTypeName: 'Transcript',
      documentTypeNameEn: 'Transcript',
      quantity: 3,
      language: 'english',
      status: 'approved',
      deliveryMethod: 'mail',
      deliveryAddress: '123 Main St, Bangkok, Thailand 10330',
      createdAt: '2025-04-02T11:15:00',
      totalPrice: 350,
      documentPrice: 300,
      shippingFee: 50,
      paidAt: '2025-04-02T12:30:00',
      approvedAt: '2025-04-02T15:45:00',
      hasPreview: true
    },
    {
      id: 'DOC-20250403-002',
      requestNumber: 'DOC-20250403-002',
      documentTypeId: 2,
      documentTypeName: 'ใบรับรองการศึกษา',
      documentTypeNameEn: 'Student Status Certificate',
      quantity: 1,
      language: 'thai',
      status: 'processing',
      deliveryMethod: 'digital',
      createdAt: '2025-04-03T08:45:00',
      totalPrice: 50,
      documentPrice: 50,
      shippingFee: 0,
      paidAt: '2025-04-03T09:30:00',
      approvedAt: '2025-04-03T10:15:00',
      hasPreview: true
    }
  ];
  
  const requestsList = document.getElementById('requests-list');
  if (requestsList) {
    if (userRequests.length === 0) {
      requestsList.innerHTML = `
        <div class="empty-requests">
          <h3>No Requests Found</h3>
          <p>You haven't submitted any document requests yet.</p>
          <button class="button primary" onclick="showPage('new-request')">Create New Request</button>
        </div>
      `;
    } else {
      let html = '<table class="requests-table">';
      html += `
        <thead>
          <tr>
            <th>Request #</th>
            <th>Document Type</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
      `;
      
      userRequests.forEach(request => {
        html += `
          <tr>
            <td>${request.requestNumber}</td>
            <td>${currentUser && currentUser.language === 'th' ? request.documentTypeName : request.documentTypeNameEn}</td>
            <td>${formatDate(request.createdAt)}</td>
            <td><span class="status-badge status-${request.status}">${getStatusLabel(request.status)}</span></td>
            <td>
              <a href="#" class="view-btn" onclick="viewRequest('${request.id}')">View Details</a>
              ${request.hasPreview ? `<a href="#" class="document-preview-badge" onclick="showDocumentPreview('${request.requestNumber}')">Preview</a>` : ''}
            </td>
          </tr>
        `;
      });
      
      html += '</tbody></table>';
      requestsList.innerHTML = html;
    }
  }
}

// Show document preview modal
function showDocumentPreview(requestNumber) {
  console.log('Showing document preview for:', requestNumber);
  
  const preview = documentPreviews[requestNumber];
  if (!preview) {
    alert('No preview available for this document.');
    return;
  }
  
  currentDocumentPreview = {
    ...preview,
    requestNumber
  };
  
  const previewContainer = document.getElementById('document-preview-image');
  
  // Clear previous content
  previewContainer.innerHTML = '';
  
  // Show appropriate preview based on type
  if (preview.type === 'pdf') {
    previewContainer.innerHTML = `
      <iframe src="${preview.preview}" title="Document Preview"></iframe>
    `;
  } else if (preview.type === 'image') {
    previewContainer.innerHTML = `
      <img src="${preview.preview}" alt="Document Preview">
    `;
  }
  
  // Only show verify and share buttons for staff and admin
  const verifyBtn = document.getElementById('verify-document-btn');
  const shareBtn = document.getElementById('share-verification-btn');
  
  if (currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin')) {
    verifyBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';
  } else {
    verifyBtn.style.display = 'none';
    shareBtn.style.display = 'none';
  }
  
  // Display the modal
  document.getElementById('document-preview-modal').style.display = 'flex';
}

// Close document preview modal
function closeDocumentPreviewModal() {
  document.getElementById('document-preview-modal').style.display = 'none';
  currentDocumentPreview = null;
}

// Verification functions
function verifyDocument() {
  // Show verification modal
  document.getElementById('verification-modal').style.display = 'flex';
  
  // Clear the verification code and results
  document.getElementById('verification-code').value = '';
  document.getElementById('verification-result').innerHTML = '';
}

// Close verification modal
function closeVerificationModal() {
  document.getElementById('verification-modal').style.display = 'none';
}

// Check verification code
function checkVerificationCode() {
  const verificationCode = document.getElementById('verification-code').value.trim();
  const verificationResult = document.getElementById('verification-result');
  
  // Check if the code exists in our database
  const documentInfo = verificationCodes[verificationCode];
  
  if (!documentInfo) {
    // Invalid code
    verificationResult.innerHTML = `
      <div class="verification-error">
        <div class="verification-icon">❌</div>
        <div class="verification-message">Invalid verification code</div>
        <p>The verification code you entered does not match any document in our system.</p>
      </div>
    `;
  } else if (documentInfo.status === 'revoked') {
    // Revoked document
    verificationResult.innerHTML = `
      <div class="verification-error">
        <div class="verification-icon">⚠️</div>
        <div class="verification-message">Document Revoked</div>
        <p>This document has been revoked and is no longer valid.</p>
        <p>Reason: ${documentInfo.revokedReason || 'Not specified'}</p>
        <p>Revoked on: ${formatDate(documentInfo.revokedOn)}</p>
      </div>
    `;
  } else {
    // Valid document
    verificationResult.innerHTML = `
      <div class="verification-success">
        <div class="verification-icon">✓</div>
        <div class="verification-message">Verification Successful</div>
        <p>This document is authentic and valid.</p>
      </div>
      <div class="verification-details">
        <div class="verification-detail-item">
          <div class="verification-detail-label">Document Type</div>
          <div class="verification-detail-value">${documentInfo.documentType}</div>
        </div>
        <div class="verification-detail-item">
          <div class="verification-detail-label">Issued To</div>
          <div class="verification-detail-value">${documentInfo.issuedTo}</div>
        </div>
        <div class="verification-detail-item">
          <div class="verification-detail-label">Issued On</div>
          <div class="verification-detail-value">${formatDate(documentInfo.issuedOn)}</div>
        </div>
        <div class="verification-detail-item">
          <div class="verification-detail-label">Valid Until</div>
          <div class="verification-detail-value">${formatDate(documentInfo.validUntil)}</div>
        </div>
      </div>
    `;
  }
}

// Document verification codes (in a real system these would be stored securely in a database)
const verificationCodes = {
  'ODOC-1234-5678-ABCD': {
    requestNumber: 'DOC-20250401-001',
    documentType: 'Graduation Certificate',
    issuedTo: 'Somsak Jaidee',
    issuedOn: '2025-04-03',
    issuedBy: 'University Registrar',
    validUntil: '2030-04-03',
    status: 'valid'
  },
  'ODOC-9876-5432-WXYZ': {
    requestNumber: 'DOC-20250402-003',
    documentType: 'Transcript',
    issuedTo: 'Malee Jaidee',
    issuedOn: '2025-04-02',
    issuedBy: 'University Registrar',
    validUntil: '2030-04-02',
    status: 'valid'
  },
  'ODOC-2468-1357-EFGH': {
    requestNumber: 'DOC-20250403-002',
    documentType: 'Student Status Certificate',
    issuedTo: 'Somchai Dee',
    issuedOn: '2025-04-03',
    issuedBy: 'Faculty Office',
    validUntil: '2025-10-03',
    status: 'valid'
  },
  'ODOC-1111-2222-REVK': {
    requestNumber: 'DOC-20250101-045',
    documentType: 'Student Status Certificate',
    issuedTo: 'Wichai Naja',
    issuedOn: '2025-01-15',
    issuedBy: 'University Registrar',
    validUntil: '2025-07-15',
    status: 'revoked',
    revokedReason: 'Document contained incorrect information',
    revokedOn: '2025-02-20'
  }
};

// Format dates for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Download document
function downloadDocument() {
  // In a real implementation, this would trigger an actual download
  // For this demo, we'll just show an alert
  alert("Document download started.");
}

// Share verification link
function shareVerificationLink() {
  // If we have a document preview with verification code
  if (currentDocumentPreview && currentDocumentPreview.verificationCode) {
    const verificationUrl = `${window.location.origin}/verify.html?code=${currentDocumentPreview.verificationCode}`;
    
    // Check if the browser supports the Web Share API
    if (navigator.share) {
      navigator.share({
        title: 'Verify Document Authenticity',
        text: 'Please use this link to verify the authenticity of my document:',
        url: verificationUrl
      })
      .catch(error => {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        copyToClipboard(verificationUrl);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard(verificationUrl);
    }
  } else {
    alert("No verification code available for this document.");
  }
}

// Copy text to clipboard
function copyToClipboard(text) {
  // Create temporary input element
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  
  // Copy the text
  document.execCommand('copy');
  document.body.removeChild(input);
  
  // Notify user
  alert("Verification link copied to clipboard!");
}

// Email settings modal
function showEmailSettingsModal() {
  document.getElementById('email-settings-modal').style.display = 'flex';
}

function closeEmailSettingsModal() {
  document.getElementById('email-settings-modal').style.display = 'none';
}

// Filter notifications based on read/unread status
function filterNotifications(filter) {
  console.log('Filtering notifications:', filter);
  
  if (filter === 'all') {
    filteredNotifications = [...notifications];
  } else if (filter === 'unread') {
    filteredNotifications = notifications.filter(note => !note.read);
  }
  
  // Update the notifications list
  const notificationsList = document.getElementById('notifications-list');
  if (notificationsList) {
    if (filteredNotifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="empty-notifications">
          <h3>No Notifications</h3>
          <p>${filter === 'unread' ? 'You have no unread notifications.' : 'You have no notifications.'}</p>
        </div>
      `;
    } else {
      let html = '';
      filteredNotifications.forEach(note => {
        html += `
          <div class="notification-item ${note.read ? '' : 'unread'}">
            <div class="notification-icon ${note.type}">
              ${note.type === 'success' ? '✓' : note.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="notification-content">
              <div class="notification-title">${note.title}</div>
              <div class="notification-message">${note.message}</div>
              <div class="notification-time">${formatDate(note.time)}</div>
              ${note.link ? `<a href="#" class="notification-action" onclick="${note.link.action}('${note.link.id}')">${note.link.label}</a>` : ''}
            </div>
            ${note.read ? '' : `<div class="notification-mark-read" onclick="markNotificationAsRead('${note.id}')">✓</div>`}
          </div>
        `;
      });
      notificationsList.innerHTML = html;
    }
  }
}

// Mark a notification as read
function markNotificationAsRead(id) {
  console.log('Marking notification as read:', id);
  
  // Find the notification and mark it as read
  const note = notifications.find(n => n.id === id);
  if (note) {
    note.read = true;
  }
  
  // Update the filtered notifications
  const currentFilter = document.querySelector('input[name="notification-filter"]:checked').value;
  filterNotifications(currentFilter);
  
  // Update notification badge
  updateNotificationBadge();
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
  console.log('Marking all notifications as read');
  
  // Mark all notifications as read
  notifications.forEach(note => {
    note.read = true;
  });
  
  // Update the filtered notifications
  const currentFilter = document.querySelector('input[name="notification-filter"]:checked').value;
  filterNotifications(currentFilter);
  
  // Update notification badge
  updateNotificationBadge();
}

// Update notification badge count
function updateNotificationBadge() {
  const unreadCount = notifications.filter(note => !note.read).length;
  const badge = document.getElementById('notification-badge');
  
  if (unreadCount > 0) {
    badge.textContent = unreadCount;
    badge.style.display = 'inline-flex';
  } else {
    badge.style.display = 'none';
  }
}

// View request details
function viewRequest(id) {
  console.log('Viewing request details:', id);
  
  // Find the request in our sample data
  const request = [
    {
      id: 'DOC-20250401-001',
      requestNumber: 'DOC-20250401-001',
      documentTypeId: 3,
      documentTypeName: 'ใบปริญญาบัตร',
      documentTypeNameEn: 'Degree Certificate',
      quantity: 2,
      language: 'thai',
      status: 'completed',
      deliveryMethod: 'pickup',
      createdAt: '2025-04-01T09:30:00',
      totalPrice: 400,
      documentPrice: 400,
      shippingFee: 0,
      paidAt: '2025-04-01T10:45:00',
      approvedAt: '2025-04-01T13:20:00',
      deliveryStatus: 'ready',
      hasPreview: true
    },
    {
      id: 'DOC-20250402-003',
      requestNumber: 'DOC-20250402-003',
      documentTypeId: 1,
      documentTypeName: 'Transcript',
      documentTypeNameEn: 'Transcript',
      quantity: 3,
      language: 'english',
      status: 'approved',
      deliveryMethod: 'mail',
      deliveryAddress: '123 Main St, Bangkok, Thailand 10330',
      createdAt: '2025-04-02T11:15:00',
      totalPrice: 350,
      documentPrice: 300,
      shippingFee: 50,
      paidAt: '2025-04-02T12:30:00',
      approvedAt: '2025-04-02T15:45:00',
      hasPreview: true
    },
    {
      id: 'DOC-20250403-002',
      requestNumber: 'DOC-20250403-002',
      documentTypeId: 2,
      documentTypeName: 'ใบรับรองการศึกษา',
      documentTypeNameEn: 'Student Status Certificate',
      quantity: 1,
      language: 'thai',
      status: 'processing',
      deliveryMethod: 'digital',
      createdAt: '2025-04-03T08:45:00',
      totalPrice: 50,
      documentPrice: 50,
      shippingFee: 0,
      paidAt: '2025-04-03T09:30:00',
      approvedAt: '2025-04-03T10:15:00',
      hasPreview: true
    }
  ].find(r => r.id === id);
  
  if (!request) {
    alert('Request not found');
    return;
  }
  
  // Show request details page
  document.getElementById('request-detail-page').style.display = 'block';
  document.getElementById('requests-page').style.display = 'none';
  
  // Populate request info
  const requestInfo = document.getElementById('request-info');
  requestInfo.innerHTML = `
    <div class="request-header">
      <div class="request-number">
        <div class="label">Request Number</div>
        <div class="value">${request.requestNumber}</div>
      </div>
      <div class="request-status">
        <div class="label">Status</div>
        <div class="value">
          <span class="status-badge status-${request.status}">${getStatusLabel(request.status)}</span>
        </div>
      </div>
    </div>
    
    <div class="request-details-grid">
      <div class="detail-item">
        <div class="label">Document Type</div>
        <div class="value">${currentUser && currentUser.language === 'th' ? request.documentTypeName : request.documentTypeNameEn}</div>
      </div>
      <div class="detail-item">
        <div class="label">Quantity</div>
        <div class="value">${request.quantity}</div>
      </div>
      <div class="detail-item">
        <div class="label">Language</div>
        <div class="value">${request.language === 'thai' ? 'Thai' : 'English'}</div>
      </div>
      <div class="detail-item">
        <div class="label">Date Requested</div>
        <div class="value">${formatDate(request.createdAt)}</div>
      </div>
      <div class="detail-item">
        <div class="label">Delivery Method</div>
        <div class="value">${request.deliveryMethod === 'pickup' ? 'Pickup in Person' : request.deliveryMethod === 'mail' ? 'Mail Delivery' : 'Digital Document'}</div>
      </div>
      
      ${request.deliveryMethod === 'mail' ? `
        <div class="detail-item full-width">
          <div class="label">Delivery Address</div>
          <div class="value address">${request.deliveryAddress}</div>
        </div>
      ` : ''}
      
      <div class="detail-item">
        <div class="label">Document Price</div>
        <div class="value">฿${request.documentPrice}</div>
      </div>
      <div class="detail-item">
        <div class="label">Shipping Fee</div>
        <div class="value">฿${request.shippingFee}</div>
      </div>
      <div class="detail-item total-price">
        <div class="label">Total Price</div>
        <div class="value">฿${request.totalPrice}</div>
      </div>
    </div>
    
    <div class="payment-section">
      <h3>Payment Information</h3>
      <div class="detail-item">
        <div class="label">Payment Status</div>
        <div class="value">
          <span class="status-badge payment-paid">Paid</span>
        </div>
      </div>
      <div class="detail-item">
        <div class="label">Payment Date</div>
        <div class="value">${formatDate(request.paidAt)}</div>
      </div>
    </div>
    
    <div class="approval-info">
      <h3>Approval Information</h3>
      <div class="detail-item">
        <div class="label">Approval Status</div>
        <div class="value">
          <span class="status-badge status-approved">Approved</span>
        </div>
      </div>
      <div class="detail-item">
        <div class="label">Approval Date</div>
        <div class="value">${formatDate(request.approvedAt)}</div>
      </div>
    </div>
    
    ${request.deliveryStatus ? `
      <div class="delivery-section">
        <h3>Delivery Information</h3>
        <div class="delivery-details">
          <div class="delivery-status">
            <div class="label">Delivery Status</div>
            <div class="value">
              <span class="delivery-status-badge delivery-status-${request.deliveryStatus}">${getDeliveryStatusLabel(request.deliveryStatus)}</span>
            </div>
          </div>
          
          ${request.hasPreview ? `
            <div class="document-preview">
              <button class="button primary" onclick="showDocumentPreview('${request.requestNumber}')">
                View Document Preview
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}
  `;
}

// Get delivery status label
function getDeliveryStatusLabel(status) {
  switch (status) {
    case 'processing':
      return 'Processing';
    case 'ready':
      return 'Ready for Pickup/Shipping';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    default:
      return status;
  }
}

// Get request status label
function getStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'processing':
      return 'Processing';
    case 'completed':
      return 'Completed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}