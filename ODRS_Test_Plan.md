# ODRS System Test Plan

## Core Features to Test

### 1. User Authentication
- [ ] User registration works correctly
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails appropriately
- [ ] Role-based access control functions properly (student, staff, admin, approver)
- [ ] User session management and token validation works
- [ ] Password reset functionality works

### 2. Document Request Submission
- [ ] List of document types loads correctly
- [ ] Price calculation is accurate based on document type and quantity
- [ ] Additional fees (e.g., shipping) are calculated correctly
- [ ] Form validation works properly
- [ ] Request submission creates a record in the database
- [ ] Request ID/number is generated in the correct format
- [ ] Success confirmation is shown to user
- [ ] Request appears in user's request history

### 3. Approval Workflow
- [ ] Pending requests appear in approver dashboard
- [ ] Approvers can view request details
- [ ] Approvers can approve/reject requests
- [ ] Multi-level approval workflow functions if applicable
- [ ] Notifications are sent to users when request status changes
- [ ] Request status updates correctly in database and UI

### 4. Payment Processing
- [ ] Payment amount matches request total
- [ ] Payment form validates input correctly
- [ ] Payment receipt is generated
- [ ] Payment status is updated in the system
- [ ] Failed payments are handled appropriately
- [ ] Payment verification works for administrators

### 5. Document Delivery
- [ ] Physical pickup option functions correctly
- [ ] Digital delivery works (if implemented)
- [ ] Mail delivery address validation works
- [ ] Tracking information is recorded
- [ ] Delivery status updates correctly
- [ ] Users can view delivery status

### 6. Document Verification
- [ ] Verification codes are generated correctly
- [ ] Document verification page loads
- [ ] Valid verification codes show correct document information
- [ ] Invalid verification codes show appropriate error
- [ ] Revoked documents show revocation information

## Testing Methodology

### Manual Testing Checklist

#### Authentication Tests
- [ ] Log in as student
- [ ] Log in as staff
- [ ] Log in as admin
- [ ] Log in as approver
- [ ] Attempt login with incorrect credentials
- [ ] Test session timeout/persistence

#### Request Submission Tests
- [ ] Create request for each document type
- [ ] Test different quantity selections
- [ ] Test different language selections
- [ ] Test different delivery methods
- [ ] Verify price calculations
- [ ] Check request creation in database

#### Approval Process Tests
- [ ] Submit test request and track through approval stages
- [ ] Test approval by appropriate role
- [ ] Test rejection scenario
- [ ] Verify notifications
- [ ] Check status updates

#### Payment Tests
- [ ] Test successful payment flow
- [ ] Test payment verification process
- [ ] Test payment receipt generation
- [ ] Verify payment records in database

#### Delivery Tests
- [ ] Test each delivery method
- [ ] Verify status updates for each stage
- [ ] Test verification code generation and validation

### System Integration Tests
- [ ] Full workflow test: request submission → approval → payment → delivery
- [ ] Test data consistency across all stages
- [ ] Verify notification system throughout process
- [ ] Test concurrent users and requests

## Test Environment Setup

1. **Development Environment**
   - Local development server
   - Test database with sample data
   - Test user accounts for each role

2. **Testing Tools**
   - Browser testing (Chrome, Firefox, Safari)
   - Mobile device testing
   - API testing tools (Postman/Insomnia)

## Known Issues & Bug Tracking

| ID | Issue Description | Status | Priority | Feature Area |
|----|------------------|--------|----------|--------------|
| 001 | Missing getStatusLabel function | Fixed | High | UI/Display |
| 002 | | | | |
| 003 | | | | |

## Test Execution Plan

1. Fix critical bugs that prevent basic functionality
2. Test core authentication and request submission
3. Test approval workflow
4. Test payment processing
5. Test document delivery and verification
6. Perform end-to-end testing
7. Document remaining issues and prioritize fixes