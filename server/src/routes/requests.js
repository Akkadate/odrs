const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const {
  createRequest,
  getMyRequests,
  getRequest,
  submitPayment,
  cancelRequest,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/requestController');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/payments'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only .jpeg, .jpg, .png, and .pdf files are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter
});

const router = express.Router();

// @route   POST /api/requests
// @desc    Create new document request
// @access  Private
router.post('/', protect, createRequest);

// @route   GET /api/requests
// @desc    Get all requests for current user
// @access  Private
router.get('/', protect, getMyRequests);

// @route   GET /api/requests/all
// @desc    Get all requests (admin/staff)
// @access  Private/Admin/Staff
router.get('/all', protect, authorize('admin', 'staff'), getAllRequests);

// @route   GET /api/requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', protect, getRequest);

// @route   POST /api/requests/:id/payment
// @desc    Submit payment for request
// @access  Private
router.post('/:id/payment', protect, upload.single('paymentProof'), submitPayment);

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel request
// @access  Private
router.put('/:id/cancel', protect, cancelRequest);

// @route   PUT /api/requests/:id/status
// @desc    Update request status (admin/staff)
// @access  Private/Admin/Staff
router.put('/:id/status', protect, authorize('admin', 'staff'), updateRequestStatus);

module.exports = router;