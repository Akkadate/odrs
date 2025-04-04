const { sequelize, connectDB } = require('./server/src/config/db');
require('dotenv').config();

// Test database connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database configuration:');
    console.log(`- Host: ${process.env.DB_HOST}`);
    console.log(`- Database: ${process.env.DB_NAME}`);
    console.log(`- User: ${process.env.DB_USER}`);
    console.log(`- Port: ${process.env.DB_PORT}`);
    console.log(`- Using SQLite: ${process.env.USE_SQLITE}`);
    
    // Connect to the database
    await connectDB();
    
    // Check connection
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Get database info
    const databaseInfo = await sequelize.query('SELECT version();');
    console.log('Database info:');
    console.log(databaseInfo[0][0]);
    
    // List tables
    console.log('\nDatabase tables:');
    const tables = await sequelize.getQueryInterface().showAllTables();
    
    if (tables.length === 0) {
      console.log('No tables found. Database might not be initialized.');
      console.log('You can run migrations with: npm run db:migrate');
    } else {
      console.log('Tables in database:');
      tables.forEach(table => {
        console.log(`- ${table}`);
      });
    }
    
    // Close connection
    await sequelize.close();
    console.log('\nConnection closed.');
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

// Run the test
testConnection();