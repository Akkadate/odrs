const { DocumentType } = require('../models');

// @desc    Get all document types
// @route   GET /api/documents
// @access  Public
exports.getDocumentTypes = async (req, res) => {
  try {
    // Get active document types
    const documentTypes = await DocumentType.findAll({
      where: { 
        isActive: true 
      },
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      count: documentTypes.length,
      data: documentTypes
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get document type by ID
// @route   GET /api/documents/:id
// @access  Public
exports.getDocumentType = async (req, res) => {
  try {
    const documentType = await DocumentType.findByPk(req.params.id);
    
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
  } catch (error) {
    console.error('Error fetching document type:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new document type
// @route   POST /api/documents
// @access  Private/Admin
exports.createDocumentType = async (req, res) => {
  try {
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      price,
      processingDays,
      requiresApproval,
      approvalLevels
    } = req.body;
    
    // Validate required fields
    if (!name || !nameEn || !price || !processingDays) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }
    
    // Create document type
    const documentType = await DocumentType.create({
      name,
      nameEn,
      description,
      descriptionEn,
      price,
      processingDays,
      requiresApproval: requiresApproval || false,
      approvalLevels,
      isActive: true
    });
    
    res.status(201).json({
      status: 'success',
      data: documentType
    });
  } catch (error) {
    console.error('Error creating document type:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update document type
// @route   PUT /api/documents/:id
// @access  Private/Admin
exports.updateDocumentType = async (req, res) => {
  try {
    const documentType = await DocumentType.findByPk(req.params.id);
    
    if (!documentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Document type not found'
      });
    }
    
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      price,
      processingDays,
      requiresApproval,
      approvalLevels,
      isActive
    } = req.body;
    
    // Update document type
    const updatedDocumentType = await documentType.update({
      name: name || documentType.name,
      nameEn: nameEn || documentType.nameEn,
      description: description !== undefined ? description : documentType.description,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : documentType.descriptionEn,
      price: price || documentType.price,
      processingDays: processingDays || documentType.processingDays,
      requiresApproval: requiresApproval !== undefined ? requiresApproval : documentType.requiresApproval,
      approvalLevels: approvalLevels !== undefined ? approvalLevels : documentType.approvalLevels,
      isActive: isActive !== undefined ? isActive : documentType.isActive
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedDocumentType
    });
  } catch (error) {
    console.error('Error updating document type:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete document type
// @route   DELETE /api/documents/:id
// @access  Private/Admin
exports.deleteDocumentType = async (req, res) => {
  try {
    const documentType = await DocumentType.findByPk(req.params.id);
    
    if (!documentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Document type not found'
      });
    }
    
    // Instead of deleting, just mark as inactive
    await documentType.update({ isActive: false });
    
    res.status(200).json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting document type:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};