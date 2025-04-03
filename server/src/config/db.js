const { Sequelize } = require('sequelize');
require('dotenv').config();

// Setup in-memory SQLite for development if DB connection fails
let sequelize;

const setupSequelize = () => {
  // Check if we should use SQLite directly
  if (process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'test') {
    console.log('Using SQLite database for development/testing');
    sequelize = new Sequelize('sqlite::memory:', {
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    });
    return sequelize;
  }

  try {
    // Try to connect to PostgreSQL
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production'
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  } catch (error) {
    console.error('Error initializing PostgreSQL connection:', error);
    
    // Fallback to SQLite in-memory for development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Falling back to SQLite in-memory database for development');
      sequelize = new Sequelize('sqlite::memory:', {
        logging: process.env.NODE_ENV === 'development' ? console.log : false
      });
    } else {
      // In production, we want to fail if we can't connect to the database
      throw error;
    }
  }
  
  return sequelize;
};

// Initialize sequelize
sequelize = setupSequelize();

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // Sync models with database (creates tables if they don't exist)
      // In production, use migrations instead
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');
      
      // If using SQLite, seed the database with sample data
      if (sequelize.options.dialect === 'sqlite') {
        console.log('Adding sample data for development/testing');
        // This would be a good place to add seed data
      }
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    
    // In development, we'll continue with in-memory SQLite
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using SQLite in-memory database for development');
      sequelize = new Sequelize('sqlite::memory:', {
        logging: false
      });
      
      await sequelize.authenticate();
      console.log('Connected to in-memory SQLite database');
      
      await sequelize.sync({ force: true });
      console.log('In-memory database tables created');
    } else {
      // In production, exit if we can't connect to the database
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };