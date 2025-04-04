/**
 * Debug login script for ODRS
 * 
 * This file implements a simplified login endpoint that bypasses
 * the regular authentication flow and directly accesses the database.
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const { sequelize } = require('./config/db');
require('dotenv').config();

// Create a simple Express server
const app = express();
const PORT = process.env.DEBUG_PORT || 5002;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'debug_secret_key', {
    expiresIn: '24h'
  });
};

// Debug login endpoint
app.post('/login', async (req, res) => {
  try {
    console.log('Debug login request received:', req.body);
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // For development, accept any password for test accounts
    if (email.endsWith('@odocs.devapp.cc')) {
      console.log('Debug login: Using development account check');
      
      try {
        // Connect to database
        await sequelize.authenticate();
        console.log('Debug login: Database connected');
        
        // Find user
        const user = await User.findOne({ where: { email } });
        console.log('Debug login: User found:', !!user);
        
        if (user) {
          // Generate token
          const token = generateToken(user.id);
          
          return res.status(200).json({
            success: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            }
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
      } catch (dbError) {
        console.error('Debug login: Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message
        });
      }
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
    
  } catch (error) {
    console.error('Debug login: Unhandled error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Debug login server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Debug login server running on port ${PORT}`);
});