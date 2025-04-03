const { Request, DocumentType, Payment, Approval, User, Notification } = require('../models');
const { sendEmail } = require('../utils/email');
const { generateRequestNumber, generateDocumentNumber, generateVerificationCode } = require('../utils/generators');
require('dotenv').config();

// @desc    Create new document request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { 
      documentTypeId, 
      quantity, 
      language, 
      deliveryMethod, 
      deliveryAddress 
    } = req.body;

    // Validate required fields
    if (!documentTypeId || !quantity || !language || !deliveryMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Validate delivery address for mail delivery
    if (deliveryMethod === 'mail' && !deliveryAddress) {
      return res.status(400).json({
        status: 'error',
        message: 'Delivery address is required for mail delivery'
      });
    }

    // Get document type
    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Document type not found'
      });
    }

    // Calculate total price
    let totalPrice = documentType.price * quantity;
    let shippingFee = 0;

    // Add shipping fee if delivery method is mail
    if (deliveryMethod === 'mail') {
      shippingFee = 50; // Default shipping fee
      totalPrice += shippingFee;
    }

    // Generate request number
    const requestNumber = generateRequestNumber();

    // Create request
    const request = await Request.create({
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
      estimatedCompletionDate: new Date(Date.now() + (documentType.processingTime || 3) * 24 * 60 * 60 * 1000)
    });

    // Create notification for user
    await Notification.create({
      userId: req.user.id,
      requestId: request.id,
      type: 'request_created',
      title: 'คำขอเอกสารถูกสร้างแล้ว',
      titleEn: 'Document Request Created',
      message: `คำขอเอกสารหมายเลข ${requestNumber} ได้ถูกสร้างแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ`,
      messageEn: `Document request number ${requestNumber} has been created. Please make a payment to proceed.`
    });

    res.status(201).json({
      status: 'success',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all requests for current user
// @route   GET /api/requests
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { userId: req.user.id },
      include: [
        { model: DocumentType },
        { model: Payment }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: DocumentType },
        { model: Payment },
        { 
          model: Approval,
          include: [
            { model: User, as: 'approver', attributes: ['firstName', 'lastName', 'approverLevel'] }
          ]
        },
        { model: User, attributes: ['firstName', 'lastName', 'email', 'phone'] }
      ]
    });

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Check if user is authorized to view this request
    if (request.userId !== req.user.id && 
        !['admin', 'staff', 'approver'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this request'
      });
    }

    res.status(200).json({
      status: 'success',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Submit payment for request
// @route   POST /api/requests/:id/payment
// @access  Private
exports.submitPayment = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Check if user is authorized
    if (request.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to submit payment for this request'
      });
    }

    // Check if payment is already submitted
    if (request.paymentStatus !== 'unpaid') {
      return res.status(400).json({
        status: 'error',
        message: `Payment is already ${request.paymentStatus}`
      });
    }

    // Handle file upload for payment proof
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload payment proof'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      requestId: request.id,
      amount: request.totalPrice,
      paymentMethod: req.body.paymentMethod || 'bank_transfer',
      paymentProofImage: req.file.filename,
      status: 'pending',
      notes: req.body.notes,
      paymentDate: new Date()
    });

    // Update request payment status
    await request.update({
      paymentStatus: 'pending'
    });

    // Create notification for staff
    await Notification.create({
      userId: req.user.id, // This will be updated to staff IDs by a background job
      requestId: request.id,
      type: 'payment_submitted',
      title: 'มีการชำระเงินใหม่',
      titleEn: 'New Payment Submitted',
      message: `มีการชำระเงินสำหรับคำขอเอกสารหมายเลข ${request.requestNumber} กรุณาตรวจสอบ`,
      messageEn: `New payment submitted for document request ${request.requestNumber}. Please verify.`
    });

    res.status(200).json({
      status: 'success',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Cancel request
// @route   PUT /api/requests/:id/cancel
// @access  Private
exports.cancelRequest = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Check if user is authorized
    if (request.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to cancel this request'
      });
    }

    // Check if request can be cancelled
    if (!['pending_payment', 'pending_approval'].includes(request.status)) {
      return res.status(400).json({
        status: 'error',
        message: `Request in ${request.status} status cannot be cancelled`
      });
    }

    // Update request status
    await request.update({
      status: 'cancelled',
      notes: req.body.reason || 'Cancelled by user'
    });

    // Create notification
    await Notification.create({
      userId: req.user.id,
      requestId: request.id,
      type: 'status_updated',
      title: 'คำขอเอกสารถูกยกเลิก',
      titleEn: 'Document Request Cancelled',
      message: `คำขอเอกสารหมายเลข ${request.requestNumber} ได้ถูกยกเลิกแล้ว`,
      messageEn: `Document request number ${request.requestNumber} has been cancelled.`
    });

    res.status(200).json({
      status: 'success',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all requests (admin/staff)
// @route   GET /api/requests/all
// @access  Private/Admin/Staff
exports.getAllRequests = async (req, res) => {
  try {
    // Build query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Allow filtering
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Search by request number or student/staff ID
    if (req.query.search) {
      // Handle this with Sequelize where clause for requestNumber
      // and include user where studentId or staffId matches
    }

    // Count total
    const total = await Request.count({ where: filter });

    // Get requests
    const requests = await Request.findAll({
      where: filter,
      include: [
        { model: DocumentType },
        { model: User, attributes: ['firstName', 'lastName', 'studentId', 'staffId', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset: startIndex
    });

    // Pagination result
    const pagination = {};
    
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      status: 'success',
      count: requests.length,
      total,
      pagination,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update request status (admin/staff)
// @route   PUT /api/requests/:id/status
// @access  Private/Admin/Staff
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, notes, trackingNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide status'
      });
    }

    const request = await Request.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Update request
    const updatedRequest = await request.update({
      status,
      notes: notes || request.notes,
      trackingNumber: trackingNumber || request.trackingNumber,
      completedDate: ['completed', 'shipped'].includes(status) ? new Date() : request.completedDate,
      documentNumber: status === 'completed' ? generateDocumentNumber() : request.documentNumber,
      verificationCode: status === 'completed' ? generateVerificationCode() : request.verificationCode
    });

    // Create notification
    let title, titleEn, message, messageEn;

    switch (status) {
      case 'in_process':
        title = 'คำขอเอกสารอยู่ระหว่างดำเนินการ';
        titleEn = 'Document Request In Process';
        message = `คำขอเอกสารหมายเลข ${request.requestNumber} อยู่ระหว่างดำเนินการ`;
        messageEn = `Document request number ${request.requestNumber} is now being processed.`;
        break;
      case 'ready_for_pickup':
        title = 'เอกสารพร้อมให้รับแล้ว';
        titleEn = 'Document Ready for Pickup';
        message = `เอกสารสำหรับคำขอหมายเลข ${request.requestNumber} พร้อมให้รับแล้ว`;
        messageEn = `Documents for request number ${request.requestNumber} are ready for pickup.`;
        break;
      case 'shipped':
        title = 'เอกสารถูกจัดส่งแล้ว';
        titleEn = 'Document Shipped';
        message = `เอกสารสำหรับคำขอหมายเลข ${request.requestNumber} ได้ถูกจัดส่งแล้ว`;
        messageEn = `Documents for request number ${request.requestNumber} have been shipped.`;
        break;
      case 'completed':
        title = 'คำขอเอกสารเสร็จสิ้นแล้ว';
        titleEn = 'Document Request Completed';
        message = `คำขอเอกสารหมายเลข ${request.requestNumber} ได้ดำเนินการเสร็จสิ้นแล้ว`;
        messageEn = `Document request number ${request.requestNumber} has been completed.`;
        break;
      default:
        title = 'สถานะคำขอเอกสารอัปเดตแล้ว';
        titleEn = 'Document Request Status Updated';
        message = `สถานะคำขอเอกสารหมายเลข ${request.requestNumber} ได้อัปเดตเป็น ${status}`;
        messageEn = `Status for document request number ${request.requestNumber} has been updated to ${status}.`;
    }

    await Notification.create({
      userId: request.userId,
      requestId: request.id,
      type: 'status_updated',
      title,
      titleEn,
      message,
      messageEn
    });

    // Send email notification
    try {
      await sendEmail({
        email: request.User.email,
        subject: request.User.language === 'en' ? titleEn : title,
        message: request.User.language === 'en' ? messageEn : message
      });
    } catch (err) {
      console.error('Email notification failed:', err);
    }

    res.status(200).json({
      status: 'success',
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};