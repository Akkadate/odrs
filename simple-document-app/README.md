# ODRS Simple Document Request App

This is a simplified implementation of the Document Request feature for the Online Document Request System (ODRS).

## Overview

This application provides a user-friendly interface for:
- Logging in with test accounts
- Browsing available document types
- Creating document requests
- Viewing request history and details
- Checking request status

## How to Use

1. Start the static server:
   ```bash
   cd /var/www/app/odocs/odrs
   node server-static-5003.js
   ```

2. Access the application at:
   ```
   http://localhost:5003/document-app
   ```

3. Log in with one of the following test accounts:
   - Student: student@odocs.devapp.cc / admin123
   - Staff: staff@odocs.devapp.cc / admin123
   - Admin: admin@odocs.devapp.cc / admin123
   - Approver: advisor@odocs.devapp.cc / admin123

4. Navigate through the application:
   - "My Requests" - View your request history
   - "New Request" - Create a new document request

## Implementation Details

This application is a simplified single-page app that communicates directly with the backend API. It demonstrates:

- User authentication (JWT tokens)
- Document request creation
- Price calculation
- Request status tracking
- Role-based access control

## API Endpoints Used

- Login: POST /api/auth/login
- List document types: GET /api/documents
- Create request: POST /api/requests
- List requests: GET /api/requests
- Get request details: GET /api/requests/:id