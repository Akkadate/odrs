const bcrypt = require('bcryptjs');
const { User, DocumentType } = require('../models');
const { generatePassword } = require('./generators');

/**
 * Seeds the database with initial data
 */
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create admin user
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123';
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@odocs.devapp.cc' },
      defaults: {
        firstName: 'Admin',
        lastName: 'User',
        firstNameEn: 'Admin',
        lastNameEn: 'User',
        email: 'admin@odocs.devapp.cc',
        phone: '0888888888',
        password: await bcrypt.hash(adminPassword, 10),
        role: 'admin'
      }
    });
    
    // Create staff user
    const staffPassword = process.env.STAFF_SEED_PASSWORD || 'staff123';
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
        password: await bcrypt.hash(staffPassword, 10),
        role: 'staff',
        department: 'สำนักทะเบียน',
        faculty: 'สำนักงานอธิการบดี'
      }
    });

    // Create approver users
    const approverPassword = process.env.APPROVER_SEED_PASSWORD || 'approver123';
    
    // 1. Advisor
    const advisorUser = await User.findOrCreate({
      where: { email: 'advisor@odocs.devapp.cc' },
      defaults: {
        firstName: 'อาจารย์',
        lastName: 'ที่ปรึกษา',
        firstNameEn: 'Advisor',
        lastNameEn: 'Professor',
        email: 'advisor@odocs.devapp.cc',
        staffId: 'STAFF002',
        phone: '0811111111',
        password: await bcrypt.hash(approverPassword, 10),
        role: 'approver',
        approverLevel: 'advisor',
        department: 'วิศวกรรมคอมพิวเตอร์',
        faculty: 'วิศวกรรมศาสตร์'
      }
    });
    
    // 2. Department Head
    const deptHeadUser = await User.findOrCreate({
      where: { email: 'department_head@odocs.devapp.cc' },
      defaults: {
        firstName: 'หัวหน้า',
        lastName: 'ภาควิชา',
        firstNameEn: 'Department',
        lastNameEn: 'Head',
        email: 'department_head@odocs.devapp.cc',
        staffId: 'STAFF003',
        phone: '0822222222',
        password: await bcrypt.hash(approverPassword, 10),
        role: 'approver',
        approverLevel: 'department_head',
        department: 'วิศวกรรมคอมพิวเตอร์',
        faculty: 'วิศวกรรมศาสตร์'
      }
    });
    
    // 3. Dean
    const deanUser = await User.findOrCreate({
      where: { email: 'dean@odocs.devapp.cc' },
      defaults: {
        firstName: 'คณบดี',
        lastName: 'คณะ',
        firstNameEn: 'Dean',
        lastNameEn: 'Faculty',
        email: 'dean@odocs.devapp.cc',
        staffId: 'STAFF004',
        phone: '0833333333',
        password: await bcrypt.hash(approverPassword, 10),
        role: 'approver',
        approverLevel: 'dean',
        department: 'สำนักงานคณบดี',
        faculty: 'วิศวกรรมศาสตร์'
      }
    });
    
    // 4. Registrar
    const registrarUser = await User.findOrCreate({
      where: { email: 'registrar@odocs.devapp.cc' },
      defaults: {
        firstName: 'นายทะเบียน',
        lastName: 'มหาวิทยาลัย',
        firstNameEn: 'University',
        lastNameEn: 'Registrar',
        email: 'registrar@odocs.devapp.cc',
        staffId: 'STAFF005',
        phone: '0844444444',
        password: await bcrypt.hash(approverPassword, 10),
        role: 'approver',
        approverLevel: 'registrar',
        department: 'สำนักทะเบียน',
        faculty: 'สำนักงานอธิการบดี'
      }
    });
    
    // Create a test student
    const studentPassword = process.env.STUDENT_SEED_PASSWORD || 'student123';
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
        password: await bcrypt.hash(studentPassword, 10),
        role: 'student',
        department: 'วิศวกรรมคอมพิวเตอร์',
        faculty: 'วิศวกรรมศาสตร์'
      }
    });
    
    // Create document types
    const documentTypes = [
      {
        name: 'ใบรับรองการเป็นนักศึกษา',
        nameEn: 'Student Status Certificate',
        description: 'เอกสารรับรองสถานะการเป็นนักศึกษาปัจจุบัน',
        descriptionEn: 'Certificate confirming current student status',
        price: 50,
        requiresApproval: false,
        approvalLevels: null,
        processingTime: 3
      },
      {
        name: 'ใบแสดงผลการเรียน (Transcript)',
        nameEn: 'Transcript',
        description: 'เอกสารแสดงผลการเรียนตลอดหลักสูตร',
        descriptionEn: 'Document showing all course grades',
        price: 100,
        requiresApproval: false,
        approvalLevels: null,
        processingTime: 5
      },
      {
        name: 'ใบรับรองการสำเร็จการศึกษา',
        nameEn: 'Graduation Certificate',
        description: 'เอกสารรับรองการสำเร็จการศึกษา',
        descriptionEn: 'Certificate confirming graduation',
        price: 200,
        requiresApproval: true,
        approvalLevels: JSON.stringify(['advisor', 'department_head', 'dean', 'registrar']),
        processingTime: 10
      },
      {
        name: 'ใบรับรองเกรดเฉลี่ย',
        nameEn: 'GPA Certificate',
        description: 'เอกสารรับรองเกรดเฉลี่ยสะสม',
        descriptionEn: 'Certificate confirming cumulative GPA',
        price: 80,
        requiresApproval: false,
        approvalLevels: null,
        processingTime: 3
      },
      {
        name: 'ใบรับรองสำหรับเงินกู้ กยศ.',
        nameEn: 'Student Loan Certificate',
        description: 'เอกสารรับรองสำหรับการกู้ยืมเงินจากกองทุน กยศ.',
        descriptionEn: 'Certificate for student loan applications',
        price: 50,
        requiresApproval: true,
        approvalLevels: JSON.stringify(['advisor', 'department_head']),
        processingTime: 7
      }
    ];
    
    // Create document types
    for (const docType of documentTypes) {
      await DocumentType.findOrCreate({
        where: { name: docType.name },
        defaults: docType
      });
    }
    
    console.log('Database seeding completed successfully');
    
    // Print test accounts if this is a development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('\n==== TEST ACCOUNTS ====');
      console.log('Admin: admin@odocs.devapp.cc / ' + adminPassword);
      console.log('Staff: staff@odocs.devapp.cc / ' + staffPassword);
      console.log('Student: student@odocs.devapp.cc / ' + studentPassword);
      console.log('Advisor: advisor@odocs.devapp.cc / ' + approverPassword);
      console.log('======================\n');
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

module.exports = seedDatabase;