const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and approver role
router.use(protect, authorize('approver'));

// @route   GET /api/approvals/pending
// @desc    Get pending approvals for logged in approver
// @access  Private/Approver
router.get('/pending', (req, res) => {
  // Placeholder - would normally fetch approvals from database
  const approvals = [
    {
      id: 'app-' + Math.random().toString(36).substring(2, 9),
      requestId: 'req-sample1',
      approverLevel: req.user.approverLevel,
      status: 'pending',
      notifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      request: {
        id: 'req-sample1',
        requestNumber: 'REQ-123456-7890',
        documentTypeId: '1',
        documentType: {
          name: 'ใบรับรองการเป็นนักศึกษา',
          nameEn: 'Student Status Certificate'
        },
        quantity: 2,
        language: 'th',
        user: {
          firstName: 'John',
          lastName: 'Doe',
          studentId: '6001234567',
          department: 'Computer Science',
          faculty: 'Engineering'
        }
      }
    }
  ];
  
  res.status(200).json({
    status: 'success',
    count: approvals.length,
    data: approvals
  });
});

// @route   GET /api/approvals
// @desc    Get all approvals for logged in approver
// @access  Private/Approver
router.get('/', (req, res) => {
  // Placeholder - would normally fetch approvals from database
  const approvals = [
    {
      id: 'app-' + Math.random().toString(36).substring(2, 9),
      requestId: 'req-sample1',
      approverLevel: req.user.approverLevel,
      status: 'pending',
      notifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      request: {
        id: 'req-sample1',
        requestNumber: 'REQ-123456-7890',
        documentTypeId: '1',
        documentType: {
          name: 'ใบรับรองการเป็นนักศึกษา',
          nameEn: 'Student Status Certificate'
        },
        quantity: 2,
        language: 'th',
        user: {
          firstName: 'John',
          lastName: 'Doe',
          studentId: '6001234567'
        }
      }
    }
  ];
  
  res.status(200).json({
    status: 'success',
    count: approvals.length,
    data: approvals
  });
});

// @route   PUT /api/approvals/:id
// @desc    Update approval status
// @access  Private/Approver
router.put('/:id', (req, res) => {
  const { status, comments, signature } = req.body;
  
  if (!status) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide status'
    });
  }
  
  // Placeholder - would normally update approval in database
  const approval = {
    id: req.params.id,
    status,
    comments: comments || '',
    signature: signature || '',
    approverId: req.user.id,
    updatedAt: new Date()
  };
  
  res.status(200).json({
    status: 'success',
    data: approval
  });
});

module.exports = router;