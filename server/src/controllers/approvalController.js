const { Request, DocumentType, Approval, User, Notification } = require('../models');
const { sendEmail } = require('../utils/email');
const { Op } = require('sequelize');
require('dotenv').config();

// @desc    Get pending approvals for logged in approver
// @route   GET /api/approvals/pending
// @access  Private/Approver
exports.getPendingApprovals = async (req, res) => {
  try {
    if (req.user.role !== 'approver' || !req.user.approverLevel) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access approvals'
      });
    }

    // Get all pending approvals for this approver level
    const approvals = await Approval.findAll({
      where: {
        approverLevel: req.user.approverLevel,
        status: 'pending'
      },
      include: [
        { 
          model: Request,
          include: [
            { model: DocumentType },
            { model: User, attributes: ['firstName', 'lastName', 'studentId', 'staffId', 'department', 'faculty'] }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      count: approvals.length,
      data: approvals
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all approvals for logged in approver
// @route   GET /api/approvals
// @access  Private/Approver
exports.getMyApprovals = async (req, res) => {
  try {
    if (req.user.role !== 'approver' || !req.user.approverLevel) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access approvals'
      });
    }

    // Build query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Filter options
    const filter = {
      approverLevel: req.user.approverLevel
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Count total
    const total = await Approval.count({ where: filter });

    // Get approvals
    const approvals = await Approval.findAll({
      where: filter,
      include: [
        { 
          model: Request,
          include: [
            { model: DocumentType },
            { model: User, attributes: ['firstName', 'lastName', 'studentId', 'staffId'] }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']],
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
      count: approvals.length,
      total,
      pagination,
      data: approvals
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update approval status
// @route   PUT /api/approvals/:id
// @access  Private/Approver
exports.updateApproval = async (req, res) => {
  try {
    const { status, comments, signature } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide status'
      });
    }

    const approval = await Approval.findByPk(req.params.id, {
      include: [
        { 
          model: Request,
          include: [
            { model: DocumentType },
            { model: User }
          ]
        }
      ]
    });

    if (!approval) {
      return res.status(404).json({
        status: 'error',
        message: 'Approval not found'
      });
    }

    // Check if user is authorized
    if (req.user.role !== 'approver' || req.user.approverLevel !== approval.approverLevel) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this approval'
      });
    }

    // Check if approval is already processed
    if (approval.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Approval is already ${approval.status}`
      });
    }

    // Update approval
    const updatedApproval = await approval.update({
      status,
      comments,
      signature: signature || approval.signature,
      approverId: req.user.id
    });

    const request = approval.Request;
    const documentType = request.DocumentType;
    const user = request.User;

    // Handle next steps based on approval status
    if (status === 'approved') {
      // Get approval levels for this document type
      const approvalLevels = documentType.approvalLevels || [];
      
      // Find current level index
      const currentLevelIndex = approvalLevels.indexOf(approval.approverLevel);
      
      if (currentLevelIndex < approvalLevels.length - 1) {
        // There are more approval levels
        const nextLevel = approvalLevels[currentLevelIndex + 1];
        
        // Update request with next approval level
        await request.update({
          currentApprovalLevel: nextLevel
        });
        
        // Find next approver
        const nextApprovers = await User.findAll({
          where: {
            role: 'approver',
            approverLevel: nextLevel,
            department: user.department,
            faculty: user.faculty
          }
        });
        
        if (nextApprovers.length > 0) {
          // Create approval for next level
          for (const approver of nextApprovers) {
            await Approval.create({
              requestId: request.id,
              approverId: approver.id,
              approverLevel: nextLevel,
              status: 'pending',
              notifiedAt: new Date()
            });
            
            // Create notification for next approver
            await Notification.create({
              userId: approver.id,
              requestId: request.id,
              type: 'approval_needed',
              title: 'มีเอกสารรอการอนุมัติ',
              titleEn: 'Document Pending Approval',
              message: `มีคำขอเอกสารหมายเลข ${request.requestNumber} รอการอนุมัติจากคุณ`,
              messageEn: `Document request number ${request.requestNumber} is pending your approval.`
            });
            
            // Send email notification
            try {
              await sendEmail({
                email: approver.email,
                subject: approver.language === 'en' ? 'Document Pending Approval' : 'มีเอกสารรอการอนุมัติ',
                message: approver.language === 'en' 
                  ? `Document request number ${request.requestNumber} is pending your approval.`
                  : `มีคำขอเอกสารหมายเลข ${request.requestNumber} รอการอนุมัติจากคุณ`
              });
            } catch (err) {
              console.error('Email notification failed:', err);
            }
          }
        }
      } else {
        // This was the final approval
        await request.update({
          status: 'in_process',
          currentApprovalLevel: null
        });
        
        // Create notification for user
        await Notification.create({
          userId: request.userId,
          requestId: request.id,
          type: 'status_updated',
          title: 'คำขอเอกสารได้รับการอนุมัติแล้ว',
          titleEn: 'Document Request Approved',
          message: `คำขอเอกสารหมายเลข ${request.requestNumber} ได้รับการอนุมัติแล้วและอยู่ระหว่างดำเนินการ`,
          messageEn: `Document request number ${request.requestNumber} has been approved and is now being processed.`
        });
        
        // Send email notification to user
        try {
          await sendEmail({
            email: user.email,
            subject: user.language === 'en' ? 'Document Request Approved' : 'คำขอเอกสารได้รับการอนุมัติแล้ว',
            message: user.language === 'en'
              ? `Your document request number ${request.requestNumber} has been approved and is now being processed.`
              : `คำขอเอกสารหมายเลข ${request.requestNumber} ของคุณได้รับการอนุมัติแล้วและอยู่ระหว่างดำเนินการ`
          });
        } catch (err) {
          console.error('Email notification failed:', err);
        }
        
        // Create notification for staff
        const staffUsers = await User.findAll({
          where: {
            role: 'staff'
          }
        });
        
        for (const staff of staffUsers) {
          await Notification.create({
            userId: staff.id,
            requestId: request.id,
            type: 'document_approved',
            title: 'เอกสารได้รับการอนุมัติแล้ว',
            titleEn: 'Document Fully Approved',
            message: `เอกสารสำหรับคำขอหมายเลข ${request.requestNumber} ได้รับการอนุมัติครบทุกขั้นตอนแล้ว`,
            messageEn: `Documents for request number ${request.requestNumber} have been fully approved and ready for processing.`
          });
        }
      }
    } else if (status === 'rejected') {
      // Update request status
      await request.update({
        status: 'rejected',
        currentApprovalLevel: null,
        notes: comments || 'Rejected by approver'
      });
      
      // Create notification for user
      await Notification.create({
        userId: request.userId,
        requestId: request.id,
        type: 'request_rejected',
        title: 'คำขอเอกสารถูกปฏิเสธ',
        titleEn: 'Document Request Rejected',
        message: `คำขอเอกสารหมายเลข ${request.requestNumber} ถูกปฏิเสธ: ${comments || 'ไม่มีเหตุผลระบุ'}`,
        messageEn: `Document request number ${request.requestNumber} has been rejected: ${comments || 'No reason provided'}`
      });
      
      // Send email notification
      try {
        await sendEmail({
          email: user.email,
          subject: user.language === 'en' ? 'Document Request Rejected' : 'คำขอเอกสารถูกปฏิเสธ',
          message: user.language === 'en'
            ? `Your document request number ${request.requestNumber} has been rejected: ${comments || 'No reason provided'}`
            : `คำขอเอกสารหมายเลข ${request.requestNumber} ของคุณถูกปฏิเสธ: ${comments || 'ไม่มีเหตุผลระบุ'}`
        });
      } catch (err) {
        console.error('Email notification failed:', err);
      }
    } else if (status === 'more_info') {
      // Create notification for user
      await Notification.create({
        userId: request.userId,
        requestId: request.id,
        type: 'more_info_needed',
        title: 'ต้องการข้อมูลเพิ่มเติมสำหรับคำขอเอกสาร',
        titleEn: 'More Information Needed for Document Request',
        message: `ต้องการข้อมูลเพิ่มเติมสำหรับคำขอเอกสารหมายเลข ${request.requestNumber}: ${comments || 'ไม่มีรายละเอียดระบุ'}`,
        messageEn: `More information needed for document request number ${request.requestNumber}: ${comments || 'No details provided'}`
      });
      
      // Send email notification
      try {
        await sendEmail({
          email: user.email,
          subject: user.language === 'en' ? 'More Information Needed for Document Request' : 'ต้องการข้อมูลเพิ่มเติมสำหรับคำขอเอกสาร',
          message: user.language === 'en'
            ? `More information needed for your document request number ${request.requestNumber}: ${comments || 'No details provided'}`
            : `ต้องการข้อมูลเพิ่มเติมสำหรับคำขอเอกสารหมายเลข ${request.requestNumber} ของคุณ: ${comments || 'ไม่มีรายละเอียดระบุ'}`
        });
      } catch (err) {
        console.error('Email notification failed:', err);
      }
    }

    res.status(200).json({
      status: 'success',
      data: updatedApproval
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};