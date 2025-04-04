const { sequelize } = require('./server/src/config/db');
const { User } = require('./server/src/models');
require('dotenv').config();

async function checkUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');

    console.log('Checking users in database...');
    const users = await User.findAll();
    
    console.log(`Total users: ${users.length}`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

// Run the function
checkUsers();