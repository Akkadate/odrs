// CORS configuration for API
require('dotenv').config();

// Default CORS options
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins for debugging
    console.log('CORS Request from origin:', origin);
    
    // Define allowed origins (add your client URLs here)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5001',
      'http://147.50.10.29:3000',
      'http://147.50.10.29:5001',
      'http://147.50.10.29'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow all origins
      callback(null, true);
      
      // For production, use this instead to restrict origins:
      // callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;