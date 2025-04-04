# Document Request Submission Feature

## Overview

The Document Request Submission feature allows users to:
1. Browse available document types
2. Submit requests for official documents
3. Calculate pricing based on document type, quantity, and delivery method
4. Track the status of their requests

## API Endpoints

### Document Types

- `GET /api/documents` - Get all document types
- `GET /api/documents/:id` - Get a specific document type
- `POST /api/documents` - Create a new document type (admin only)
- `PUT /api/documents/:id` - Update a document type (admin only)
- `DELETE /api/documents/:id` - Delete a document type (admin only)

### Document Requests

- `POST /api/requests` - Create a new document request
- `GET /api/requests` - Get all requests for the current user
- `GET /api/requests/:id` - Get a specific request
- `POST /api/requests/:id/payment` - Submit payment for a request
- `PUT /api/requests/:id/cancel` - Cancel a request
- `GET /api/requests/all` - Get all requests (admin/staff only)
- `PUT /api/requests/:id/status` - Update request status (admin/staff only)

## Component Structure

1. `RequestForm.js` - Form for creating new document requests
2. `RequestList.js` - List of user's document requests
3. `RequestDetails.js` - Detailed view of a specific request

## Database Models

1. `DocumentType` - Stores information about available document types
2. `Request` - Stores document request details
3. `Payment` - Stores payment information for requests
4. `Approval` - Stores approval information for requests requiring approval

## Usage Flow

1. User logs in to the system
2. User navigates to "New Request" page
3. User selects document type, quantity, language, and delivery method
4. User calculates price and submits the request
5. System creates a new request with status "pending_payment"
6. User is redirected to their requests list

## Payment Flow

After submitting a request:
1. User views the request details
2. User uploads proof of payment
3. Staff verifies the payment
4. Request moves to "pending_approval" or "in_process" status

## Implementation Status

- [x] Backend API endpoints for document requests
- [x] Backend controllers and models for document requests
- [x] Frontend service for document requests
- [x] RequestForm component for submitting new requests
- [ ] Payment submission UI
- [ ] Request status tracking UI
- [ ] Admin/staff approval interface

## Testing

To test the document request submission:

1. Log in as a student user (student@odocs.devapp.cc / admin123)
2. Navigate to the "New Request" page
3. Fill out the request form
4. Click "Calculate Price" to see the estimated cost
5. Submit the request

## Next Steps

1. Implement the approval workflow:
   - Create UI for approvers to view and approve/reject requests
   - Implement email notifications for approvals

2. Enhance payment processing:
   - Add payment method selection
   - Improve payment proof upload
   - Create staff interface for payment verification

3. Develop document delivery system:
   - Track document delivery status
   - Generate verification codes for completed documents
   - Create document verification page