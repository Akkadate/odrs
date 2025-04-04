const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDocumentTypes,
  getDocumentType,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType
} = require('../controllers/documentController');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all document types
// @access  Public
router.get('/', getDocumentTypes);

// @route   GET /api/documents/:id
// @desc    Get document type by ID
// @access  Public
router.get('/:id', getDocumentType);

// @route   POST /api/documents
// @desc    Create new document type (admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), createDocumentType);

// @route   PUT /api/documents/:id
// @desc    Update document type (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), updateDocumentType);

// @route   DELETE /api/documents/:id
// @desc    Delete document type (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteDocumentType);

module.exports = router;