const bcrypt = require('bcryptjs');
const { sequelize } = require('./server/src/config/db');
const { User, DocumentType } = require('./server/src/models');
require('dotenv').config();

async function seedUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');

    console.log('Creating test users...');
    
    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@odocs.devapp.cc' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        firstNameEn: 'Admin',
        lastNameEn: 'User',
        email: 'admin@odocs.devapp.cc',
        phone: '0888888888',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    });

    // Create staff user
    const staffUser = await User.findOrCreate({
      where: { email: 'staff@odocs.devapp.cc' },
      defaults: {
        firstName: 'เจ้าหน้าที่',
        lastName: 'ทดสอบ',
        firstNameEn: 'Staff',
        lastNameEn: 'Test',
        email: 'staff@odocs.devapp.cc',
        staffId: 'STAFF001',
        phone: '0899999999',
        password: await bcrypt.hash('admin123', 10),
        role: 'staff',
        department: 'สำนักทะเบียน',
        faculty: 'สำนักงานอธิการบดี'
      }
    });

    // Create student user
    const studentUser = await User.findOrCreate({
      where: { email: 'student@odocs.devapp.cc' },
      defaults: {
        firstName: 'นักศึกษา',
        lastName: 'ทดสอบ',
        firstNameEn: 'Student',
        lastNameEn: 'Test',
        email: 'student@odocs.devapp.cc',
        studentId: '6000000001',
        phone: '0855555555',
        password: await bcrypt.hash('admin123', 10),
        role: 'student',
        department: 'วิศวกรรมคอมพิวเตอร์',
        faculty: 'วิศวกรรมศาสตร์'
      }
    });

    // Create approver user
    const approverUser = await User.findOrCreate({
      where: { email: 'advisor@odocs.devapp.cc' },
      defaults: {
        firstName: 'อาจารย์',
        lastName: 'ที่ปรึกษา',
        firstNameEn: 'Advisor',
        lastNameEn: 'Professor',
        email: 'advisor@odocs.devapp.cc',
        staffId: 'STAFF002',
        phone: '0811111111',
        password: await bcrypt.hash('admin123', 10),
        role: 'approver',
        approverLevel: 'advisor',
        department: 'วิศวกรรมคอมพิวเตอร์',
        faculty: 'วิศวกรรมศาสตร์'
      }
    });

    console.log('Test users created successfully');

    console.log('Creating document types...');
    
    // Create document types
    const documentTypes = [
      {
        name: 'ใบรับรองการเป็นนักศึกษา',
        nameEn: 'Student Status Certificate',
        description: 'เอกสารรับรองสถานะการเป็นนักศึกษาปัจจุบัน',
        descriptionEn: 'Certificate confirming current student status',
        price: 50,
        processingDays: 3,
        requiresApproval: false,
        isActive: true
      },
      {
        name: 'ใบแสดงผลการเรียน (Transcript)',
        nameEn: 'Transcript',
        description: 'เอกสารแสดงผลการเรียนตลอดหลักสูตร',
        descriptionEn: 'Document showing all course grades',
        price: 100,
        processingDays: 5,
        requiresApproval: false,
        isActive: true
      },
      {
        name: 'ใบรับรองการสำเร็จการศึกษา',
        nameEn: 'Graduation Certificate',
        description: 'เอกสารรับรองการสำเร็จการศึกษา',
        descriptionEn: 'Certificate confirming graduation',
        price: 200,
        processingDays: 10,
        requiresApproval: true,
        approvalLevels: JSON.stringify(['advisor', 'department_head', 'dean', 'registrar']),
        isActive: true
      },
      {
        name: 'ใบรับรองเกรดเฉลี่ย',
        nameEn: 'GPA Certificate',
        description: 'เอกสารรับรองเกรดเฉลี่ยสะสม',
        descriptionEn: 'Certificate confirming cumulative GPA',
        price: 80,
        processingDays: 3,
        requiresApproval: false,
        isActive: true
      },
      {
        name: 'ใบรับรองสำหรับเงินกู้ กยศ.',
        nameEn: 'Student Loan Certificate',
        description: 'เอกสารรับรองสำหรับการกู้ยืมเงินจากกองทุน กยศ.',
        descriptionEn: 'Certificate for student loan applications',
        price: 50,
        processingDays: 7,
        requiresApproval: true,
        approvalLevels: JSON.stringify(['advisor', 'department_head']),
        isActive: true
      }
    ];
    
    for (const docType of documentTypes) {
      await DocumentType.findOrCreate({
        where: { nameEn: docType.nameEn },
        defaults: docType
      });
    }
    
    console.log('Document types created successfully');

    // Print test account information
    console.log('\n==== TEST ACCOUNTS ====');
    console.log('Admin: admin@odocs.devapp.cc / admin123');
    console.log('Staff: staff@odocs.devapp.cc / admin123');
    console.log('Student: student@odocs.devapp.cc / admin123');
    console.log('Approver: advisor@odocs.devapp.cc / admin123');
    console.log('======================\n');

    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
    
    return true;
  } catch (error) {
    console.error('Error seeding users:', error);
    return false;
  }
}

// Run the function
seedUsers();