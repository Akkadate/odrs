const { sequelize } = require('./server/src/config/db');
const { User } = require('./server/src/models');
require('dotenv').config();

async function testLogin() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');

    // Test credentials
    const email = 'student@odocs.devapp.cc';
    const password = 'admin123';

    console.log(`Attempting to login with: ${email}`);
    
    // Find the user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error('User not found');
      return false;
    }
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (isMatch) {
      console.log('✅ Login successful!');
      console.log('User details:');
      console.log(`- Name: ${user.firstName} ${user.lastName}`);
      console.log(`- Role: ${user.role}`);
      return true;
    } else {
      console.error('❌ Password does not match');
      return false;
    }
  } catch (error) {
    console.error('Error during login test:', error);
    return false;
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the test
testLogin();