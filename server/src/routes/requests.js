const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

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
router.post('/', protect, (req, res) => {
  // Placeholder - would normally create request in database
  const { documentTypeId, quantity, language, deliveryMethod, deliveryAddress } = req.body;
  
  // Basic validation
  if (!documentTypeId || !quantity || !language || !deliveryMethod) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide all required fields'
    });
  }
  
  // Generate request number
  const requestNumber = 'REQ-' + Date.now().toString().slice(-6) + '-' + 
    Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Calculate total price (mocked)
  const documentPrice = 100; // This would come from document type
  let totalPrice = documentPrice * quantity;
  let shippingFee = 0;
  
  if (deliveryMethod === 'mail') {
    shippingFee = 50;
    totalPrice += shippingFee;
  }
  
  const request = {
    id: 'req-' + Math.random().toString(36).substring(2, 9),
    requestNumber,
    userId: req.user.id,
    documentTypeId,
    quantity,
    language,
    deliveryMethod,
    deliveryAddress,
    totalPrice,
    shippingFee,
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    createdAt: new Date(),
    estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // +3 days
  };
  
  res.status(201).json({
    status: 'success',
    data: request
  });
});

// @route   GET /api/requests
// @desc    Get all requests for current user
// @access  Private
router.get('/', protect, (req, res) => {
  // Placeholder - would normally fetch requests from database
  const requests = [
    {
      id: 'req-sample1',
      requestNumber: 'REQ-123456-7890',
      documentTypeId: '1',
      quantity: 2,
      language: 'th',
      deliveryMethod: 'pickup',
      totalPrice: 200,
      status: 'pending_payment',
      paymentStatus: 'unpaid',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ];
  
  res.status(200).json({
    status: 'success',
    count: requests.length,
    data: requests
  });
});

// @route   GET /api/requests/all
// @desc    Get all requests (admin/staff)
// @access  Private/Admin/Staff
router.get('/all', protect, authorize('admin', 'staff'), (req, res) => {
  // Placeholder - would normally fetch all requests from database
  const requests = [
    {
      id: 'req-sample1',
      requestNumber: 'REQ-123456-7890',
      documentTypeId: '1',
      quantity: 2,
      language: 'th',
      deliveryMethod: 'pickup',
      totalPrice: 200,
      status: 'pending_payment',
      paymentStatus: 'unpaid',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ];
  
  res.status(200).json({
    status: 'success',
    count: requests.length,
    data: requests
  });
});

// @route   GET /api/requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', protect, (req, res) => {
  // Placeholder - would normally fetch request from database
  const request = {
    id: req.params.id,
    requestNumber: 'REQ-123456-7890',
    documentTypeId: '1',
    quantity: 2,
    language: 'th',
    deliveryMethod: 'pickup',
    totalPrice: 200,
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  };
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});

// @route   POST /api/requests/:id/payment
// @desc    Submit payment for request
// @access  Private
router.post('/:id/payment', protect, upload.single('paymentProof'), (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'Please upload payment proof'
    });
  }
  
  // Placeholder - would normally update request and create payment record in database
  const payment = {
    id: 'pay-' + Math.random().toString(36).substring(2, 9),
    requestId: req.params.id,
    amount: 200, // This would come from request
    paymentMethod: req.body.paymentMethod || 'bank_transfer',
    paymentProofImage: req.file.filename,
    status: 'pending',
    paymentDate: new Date()
  };
  
  res.status(200).json({
    status: 'success',
    data: payment
  });
});

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel request
// @access  Private
router.put('/:id/cancel', protect, (req, res) => {
  // Placeholder - would normally update request status in database
  const request = {
    id: req.params.id,
    status: 'cancelled',
    notes: req.body.reason || 'Cancelled by user'
  };
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});

// @route   PUT /api/requests/:id/status
// @desc    Update request status (admin/staff)
// @access  Private/Admin/Staff
router.put('/:id/status', protect, authorize('admin', 'staff'), (req, res) => {
  const { status, notes, trackingNumber } = req.body;
  
  if (!status) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide status'
    });
  }
  
  // Placeholder - would normally update request status in database
  const request = {
    id: req.params.id,
    status,
    notes: notes || '',
    trackingNumber: trackingNumber || '',
    updatedAt: new Date()
  };
  
  res.status(200).json({
    status: 'success',
    data: request
  });
});

module.exports = router;