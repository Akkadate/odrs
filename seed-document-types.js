/**
 * Seed script for document types
 */
const { sequelize } = require('./server/src/config/db');
require('dotenv').config();

async function seedDocumentTypes() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');
    
    console.log('Creating document types...');
    
    // Insert document types one by one
    await sequelize.query(`
      INSERT INTO "DocumentTypes" (
        "name", 
        "nameEn", 
        "description", 
        "descriptionEn", 
        "price", 
        "processingDays",
        "requiresApproval",
        "isActive",
        "createdAt",
        "updatedAt"
      ) VALUES (
        'ใบรับรองการเป็นนักศึกษา',
        'Student Status Certificate',
        'เอกสารรับรองสถานะการเป็นนักศึกษาปัจจุบัน',
        'Certificate confirming current student status',
        50,
        3,
        false,
        true,
        NOW(),
        NOW()
      );
    `);
    
    await sequelize.query(`
      INSERT INTO "DocumentTypes" (
        "name", 
        "nameEn", 
        "description", 
        "descriptionEn", 
        "price", 
        "processingDays",
        "requiresApproval",
        "isActive",
        "createdAt",
        "updatedAt"
      ) VALUES (
        'ใบแสดงผลการเรียน (Transcript)',
        'Transcript',
        'เอกสารแสดงผลการเรียนตลอดหลักสูตร',
        'Document showing all course grades',
        100,
        5,
        false,
        true,
        NOW(),
        NOW()
      );
    `);
    
    await sequelize.query(`
      INSERT INTO "DocumentTypes" (
        "name", 
        "nameEn", 
        "description", 
        "descriptionEn", 
        "price", 
        "processingDays",
        "requiresApproval",
        "isActive",
        "createdAt",
        "updatedAt"
      ) VALUES (
        'ใบรับรองการสำเร็จการศึกษา',
        'Graduation Certificate',
        'เอกสารรับรองการสำเร็จการศึกษา',
        'Certificate confirming graduation',
        200,
        10,
        true,
        true,
        NOW(),
        NOW()
      );
    `);
    
    console.log('Document types created successfully');
    
    // Check how many document types we have
    const [result] = await sequelize.query('SELECT COUNT(*) FROM "DocumentTypes"');
    console.log(`Total document types in database: ${result[0].count}`);
    
    await sequelize.close();
    console.log('Database connection closed');
    
    return true;
  } catch (error) {
    console.error('Error seeding document types:', error);
    return false;
  }
}

// Run the seeder
seedDocumentTypes();