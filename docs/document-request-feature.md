# Document Request Submission Feature

This document outlines the implementation of the Document Request Submission feature in the ODRS system.

## Overview

The Document Request Submission feature allows users to:
- Browse available document types
- Request documents with specific parameters (quantity, language, delivery method)
- View pricing information
- Submit requests
- Track request status

## Backend Implementation

The backend implementation (`server-static.js`) includes:

### 1. Document Types Data Structure

```javascript
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
  // Additional document types...
];
```

### 2. API Endpoints

#### Document Type Endpoints

- `GET /api/documents` - List all active document types
- `GET /api/documents/:id` - Get details for a specific document type

#### Document Request Endpoints

- `POST /api/requests` - Create a new document request
- `GET /api/requests` - List all requests for current user
- `GET /api/requests/:id` - Get details for a specific request

### 3. Request Workflow

- Request creation with status based on document type requirements
- Role-based access control (students, approvers, staff, admin)
- Pricing calculation based on document type, quantity, and delivery method
- Request tracking with status updates

## Frontend Implementation

The frontend implementation includes:

### 1. React Components

- `RequestForm` - Form for creating new document requests
- `RequestList` - List of user's document requests
- `RequestDetails` - Detailed view of a document request

### 2. Features

- Real-time price calculation
- Dynamic form fields based on selected delivery method
- Bilingual support (Thai/English)
- Status tracking with visual indicators
- Role-based UI

## Authentication & Authorization

- JWT-based authentication
- User roles: student, staff, approver, admin
- Role-based access control for document requests
- Approver-specific views for different approval levels

## Testing

### Option 1: Using the Simple Document App (Recommended)

1. Start the static server:
   ```bash
   node server-static-5003.js
   ```

2. Access the application at http://localhost:5003/document-app

3. Log in with one of the test accounts:
   - Student: student@odocs.devapp.cc / admin123
   - Staff: staff@odocs.devapp.cc / admin123
   - Admin: admin@odocs.devapp.cc / admin123
   - Approver: advisor@odocs.devapp.cc / admin123

4. You'll see a dashboard with feature buttons. When clicked, they will explain that the Document Request feature needs to be accessed through the React application.

### Option 2: Using the Original Static HTML Dashboard

If you prefer the original dashboard:

1. Start the static server:
   ```bash
   node server-static-5003.js
   ```

2. Access the application at http://localhost:5003

3. When clicking on feature buttons, you'll be instructed how to use the document request feature.

### Using the Document Request Features

Once you have either method running:

1. Log in with a test account
2. Navigate to "New Request" to test the document request form
3. Fill in the required fields and calculate the price
4. Submit the request
5. Check "My Requests" to see the list of submitted requests
6. Click on a request to view its details

## Next Steps

- Implement payment integration
- Add approval workflow functionality
- Create notification system
- Implement document delivery tracking