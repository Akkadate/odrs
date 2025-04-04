/**
 * Test script for the debug login server
 */
const { sequelize } = require('./server/src/config/db');
const { User } = require('./server/src/models');
require('dotenv').config();

async function testDebugLogin() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    console.log('Querying users...');
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

testDebugLogin();