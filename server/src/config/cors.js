// CORS configuration for API
require('dotenv').config();

// Default CORS options
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins for debugging
    console.log('CORS Request from origin:', origin);
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;