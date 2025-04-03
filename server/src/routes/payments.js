const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments (admin/staff only)
// @access  Private/Admin/Staff
router.get('/', protect, authorize('admin', 'staff'), (req, res) => {
  // Placeholder - would normally fetch payments from database
  res.status(200).json({
    status: 'success',
    data: []
  });
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', protect, (req, res) => {
  // Placeholder - would normally fetch payment from database
  res.status(200).json({
    status: 'success',
    data: {
      id: req.params.id,
      amount: 300,
      status: 'pending',
      requestId: 'sample-request-id',
      createdAt: new Date()
    }
  });
});

// @route   PUT /api/payments/:id/verify
// @desc    Verify payment (admin/staff only)
// @access  Private/Admin/Staff
router.put('/:id/verify', protect, authorize('admin', 'staff'), (req, res) => {
  // Placeholder - would normally update payment status in database
  res.status(200).json({
    status: 'success',
    data: {
      id: req.params.id,
      status: 'verified',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    }
  });
});

// @route   PUT /api/payments/:id/reject
// @desc    Reject payment (admin/staff only)
// @access  Private/Admin/Staff
router.put('/:id/reject', protect, authorize('admin', 'staff'), (req, res) => {
  // Placeholder - would normally update payment status in database
  res.status(200).json({
    status: 'success',
    data: {
      id: req.params.id,
      status: 'rejected',
      notes: req.body.notes || 'Payment rejected',
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    }
  });
});

module.exports = router;