const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: req.user
  });
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, (req, res) => {
  // This is a placeholder route - would normally update user details
  res.status(200).json({
    status: 'success',
    data: req.user
  });
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), (req, res) => {
  // This is a placeholder route - would normally return all users
  res.status(200).json({
    status: 'success',
    data: []
  });
});

module.exports = router;