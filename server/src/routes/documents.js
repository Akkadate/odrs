const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/documents
// @desc    Get all document types
// @access  Public
router.get('/', (req, res) => {
  // Placeholder - would normally fetch document types from database
  const documentTypes = [
    {
      id: '1',
      name: 'ใบรับรองการเป็นนักศึกษา',
      nameEn: 'Student Status Certificate',
      description: 'เอกสารรับรองสถานะการเป็นนักศึกษาปัจจุบัน',
      descriptionEn: 'Document certifying current student status',
      price: 100,
      requiresApproval: false,
      isActive: true,
      processingTime: 3
    },
    {
      id: '2',
      name: 'ใบแสดงผลการเรียน',
      nameEn: 'Transcript',
      description: 'เอกสารแสดงผลการเรียนตลอดหลักสูตร',
      descriptionEn: 'Document showing academic records',
      price: 200,
      requiresApproval: false,
      isActive: true,
      processingTime: 5
    },
    {
      id: '3',
      name: 'ใบรับรองการสำเร็จการศึกษา',
      nameEn: 'Graduation Certificate',
      description: 'เอกสารรับรองการสำเร็จการศึกษา',
      descriptionEn: 'Document certifying graduation',
      price: 300,
      requiresApproval: true,
      approvalLevels: ['advisor', 'department_head', 'dean'],
      isActive: true,
      processingTime: 7
    }
  ];
  
  res.status(200).json({
    status: 'success',
    data: documentTypes
  });
});

// @route   GET /api/documents/:id
// @desc    Get document type by ID
// @access  Public
router.get('/:id', (req, res) => {
  // Placeholder - would normally fetch document type from database
  const documentTypes = [
    {
      id: '1',
      name: 'ใบรับรองการเป็นนักศึกษา',
      nameEn: 'Student Status Certificate',
      description: 'เอกสารรับรองสถานะการเป็นนักศึกษาปัจจุบัน',
      descriptionEn: 'Document certifying current student status',
      price: 100,
      requiresApproval: false,
      isActive: true,
      processingTime: 3
    },
    {
      id: '2',
      name: 'ใบแสดงผลการเรียน',
      nameEn: 'Transcript',
      description: 'เอกสารแสดงผลการเรียนตลอดหลักสูตร',
      descriptionEn: 'Document showing academic records',
      price: 200,
      requiresApproval: false,
      isActive: true,
      processingTime: 5
    },
    {
      id: '3',
      name: 'ใบรับรองการสำเร็จการศึกษา',
      nameEn: 'Graduation Certificate',
      description: 'เอกสารรับรองการสำเร็จการศึกษา',
      descriptionEn: 'Document certifying graduation',
      price: 300,
      requiresApproval: true,
      approvalLevels: ['advisor', 'department_head', 'dean'],
      isActive: true,
      processingTime: 7
    }
  ];
  
  const documentType = documentTypes.find(doc => doc.id === req.params.id);
  
  if (!documentType) {
    return res.status(404).json({
      status: 'error',
      message: 'Document type not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: documentType
  });
});

// @route   POST /api/documents
// @desc    Create new document type (admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), (req, res) => {
  // Placeholder - would normally create document type in database
  res.status(201).json({
    status: 'success',
    data: req.body
  });
});

// @route   PUT /api/documents/:id
// @desc    Update document type (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), (req, res) => {
  // Placeholder - would normally update document type in database
  res.status(200).json({
    status: 'success',
    data: { ...req.body, id: req.params.id }
  });
});

// @route   DELETE /api/documents/:id
// @desc    Delete document type (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  // Placeholder - would normally delete document type from database
  res.status(200).json({
    status: 'success',
    data: {}
  });
});

module.exports = router;