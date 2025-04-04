'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed Users
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@odocs.devapp.cc',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        department: 'IT',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'staff@odocs.devapp.cc',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Staff',
        lastName: 'User',
        role: 'staff',
        department: 'Registrar',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'student@odocs.devapp.cc',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Student',
        lastName: 'User',
        role: 'student',
        studentId: '6012345678',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'advisor@odocs.devapp.cc',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Advisor',
        lastName: 'User',
        role: 'approver',
        department: 'Computer Science',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Seed DocumentTypes
    await queryInterface.bulkInsert('DocumentTypes', [
      {
        name: 'Transcript',
        nameEn: 'Transcript',
        price: 100.00,
        processingDays: 3,
        active: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ใบรับรองการศึกษา',
        nameEn: 'Student Status Certificate',
        price: 50.00,
        processingDays: 2,
        active: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ใบปริญญาบัตร',
        nameEn: 'Degree Certificate',
        price: 200.00,
        processingDays: 5,
        active: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ใบแทนปริญญาบัตร',
        nameEn: 'Replacement Degree Certificate',
        price: 500.00,
        processingDays: 10,
        active: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ใบรับรองคะแนน',
        nameEn: 'Grade Certification',
        price: 100.00,
        processingDays: 3,
        active: true,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Get user IDs
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM "Users";`
    );
    
    const userRows = users[0];
    const studentId = userRows.find(u => u.email === 'student@odocs.devapp.cc').id;
    const approverId = userRows.find(u => u.email === 'advisor@odocs.devapp.cc').id;
    const staffId = userRows.find(u => u.email === 'staff@odocs.devapp.cc').id;

    // Get document type IDs
    const docTypes = await queryInterface.sequelize.query(
      `SELECT id, "nameEn" FROM "DocumentTypes";`
    );
    
    const docTypeRows = docTypes[0];
    const transcriptId = docTypeRows.find(d => d.nameEn === 'Transcript').id;
    const certificateId = docTypeRows.find(d => d.nameEn === 'Student Status Certificate').id;
    const degreeId = docTypeRows.find(d => d.nameEn === 'Degree Certificate').id;

    // Seed Requests
    await queryInterface.bulkInsert('Requests', [
      {
        requestNumber: 'DOC-20250401-001',
        userId: studentId,
        documentTypeId: degreeId,
        quantity: 2,
        language: 'english',
        status: 'completed',
        deliveryMethod: 'pickup',
        totalPrice: 400.00,
        documentPrice: 400.00,
        shippingFee: 0.00,
        paidAt: new Date('2025-04-01T10:45:00'),
        paymentReference: 'PAY123456',
        approvedAt: new Date('2025-04-01T13:20:00'),
        completedAt: new Date('2025-04-03T09:00:00'),
        deliveryStatus: 'ready',
        verificationCode: 'ODOC-1234-5678-ABCD',
        createdAt: new Date('2025-04-01T09:30:00'),
        updatedAt: new Date('2025-04-03T09:00:00')
      },
      {
        requestNumber: 'DOC-20250402-003',
        userId: studentId,
        documentTypeId: transcriptId,
        quantity: 3,
        language: 'english',
        status: 'approved',
        deliveryMethod: 'mail',
        deliveryAddress: '123 Main St, Bangkok, Thailand 10330',
        totalPrice: 350.00,
        documentPrice: 300.00,
        shippingFee: 50.00,
        paidAt: new Date('2025-04-02T12:30:00'),
        paymentReference: 'PAY123457',
        approvedAt: new Date('2025-04-02T15:45:00'),
        verificationCode: 'ODOC-9876-5432-WXYZ',
        createdAt: new Date('2025-04-02T11:15:00'),
        updatedAt: new Date('2025-04-02T15:45:00')
      },
      {
        requestNumber: 'DOC-20250403-002',
        userId: studentId,
        documentTypeId: certificateId,
        quantity: 1,
        language: 'english',
        status: 'processing',
        deliveryMethod: 'digital',
        totalPrice: 50.00,
        documentPrice: 50.00,
        shippingFee: 0.00,
        paidAt: new Date('2025-04-03T09:30:00'),
        paymentReference: 'PAY123458',
        approvedAt: new Date('2025-04-03T10:15:00'),
        verificationCode: 'ODOC-2468-1357-EFGH',
        createdAt: new Date('2025-04-03T08:45:00'),
        updatedAt: new Date('2025-04-03T10:15:00')
      }
    ], {});

    // Get request IDs
    const requests = await queryInterface.sequelize.query(
      `SELECT id, "requestNumber" FROM "Requests";`
    );
    
    const requestRows = requests[0];
    const req1Id = requestRows.find(r => r.requestNumber === 'DOC-20250401-001').id;
    const req2Id = requestRows.find(r => r.requestNumber === 'DOC-20250402-003').id;
    const req3Id = requestRows.find(r => r.requestNumber === 'DOC-20250403-002').id;

    // Seed Approvals
    await queryInterface.bulkInsert('Approvals', [
      {
        requestId: req1Id,
        approverId: approverId,
        status: 'approved',
        level: 'advisor',
        decidedAt: new Date('2025-04-01T13:20:00'),
        createdAt: new Date('2025-04-01T10:00:00'),
        updatedAt: new Date('2025-04-01T13:20:00')
      },
      {
        requestId: req2Id,
        approverId: approverId,
        status: 'approved',
        level: 'advisor',
        decidedAt: new Date('2025-04-02T15:45:00'),
        createdAt: new Date('2025-04-02T11:30:00'),
        updatedAt: new Date('2025-04-02T15:45:00')
      },
      {
        requestId: req3Id,
        approverId: approverId,
        status: 'approved',
        level: 'advisor',
        decidedAt: new Date('2025-04-03T10:15:00'),
        createdAt: new Date('2025-04-03T09:00:00'),
        updatedAt: new Date('2025-04-03T10:15:00')
      }
    ], {});

    // Seed Payments
    await queryInterface.bulkInsert('Payments', [
      {
        requestId: req1Id,
        amount: 400.00,
        paymentMethod: 'bank_transfer',
        transactionReference: 'TX123456',
        paymentProofPath: '/uploads/payments/proof_001.jpg',
        status: 'verified',
        verifiedBy: staffId,
        verifiedAt: new Date('2025-04-01T10:45:00'),
        createdAt: new Date('2025-04-01T10:00:00'),
        updatedAt: new Date('2025-04-01T10:45:00')
      },
      {
        requestId: req2Id,
        amount: 350.00,
        paymentMethod: 'credit_card',
        transactionReference: 'TX123457',
        status: 'verified',
        verifiedBy: staffId,
        verifiedAt: new Date('2025-04-02T12:30:00'),
        createdAt: new Date('2025-04-02T12:15:00'),
        updatedAt: new Date('2025-04-02T12:30:00')
      },
      {
        requestId: req3Id,
        amount: 50.00,
        paymentMethod: 'qr_code',
        transactionReference: 'TX123458',
        status: 'verified',
        verifiedBy: staffId,
        verifiedAt: new Date('2025-04-03T09:30:00'),
        createdAt: new Date('2025-04-03T09:15:00'),
        updatedAt: new Date('2025-04-03T09:30:00')
      }
    ], {});

    // Seed Notifications
    await queryInterface.bulkInsert('Notifications', [
      {
        userId: studentId,
        title: 'Document Request Approved',
        message: 'Your request DOC-20250401-001 has been approved.',
        type: 'success',
        read: false,
        relatedId: req1Id,
        relatedType: 'request',
        link: '/requests/' + req1Id,
        createdAt: new Date('2025-04-02T10:30:00'),
        updatedAt: new Date('2025-04-02T10:30:00')
      },
      {
        userId: studentId,
        title: 'Payment Verified',
        message: 'Your payment for request DOC-20250402-003 has been verified.',
        type: 'info',
        read: true,
        relatedId: req2Id,
        relatedType: 'payment',
        link: '/requests/' + req2Id,
        createdAt: new Date('2025-04-01T14:45:00'),
        updatedAt: new Date('2025-04-01T15:00:00')
      },
      {
        userId: studentId,
        title: 'Document Ready for Pickup',
        message: 'Your document for request DOC-20250403-002 is ready for pickup.',
        type: 'info',
        read: false,
        relatedId: req3Id,
        relatedType: 'request',
        link: '/requests/' + req3Id,
        createdAt: new Date('2025-03-30T09:15:00'),
        updatedAt: new Date('2025-03-30T09:15:00')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove data in reverse order
    await queryInterface.bulkDelete('Notifications', null, {});
    await queryInterface.bulkDelete('Payments', null, {});
    await queryInterface.bulkDelete('Approvals', null, {});
    await queryInterface.bulkDelete('Requests', null, {});
    await queryInterface.bulkDelete('DocumentTypes', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};