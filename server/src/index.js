const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { connectDB } = require('./config/db');
const corsOptions = require('./config/cors');
const seedDatabase = require('./utils/seeder');
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to database
const initializeDatabase = async () => {
  await connectDB();
  
  // Seed database in development mode
  if (process.env.NODE_ENV === 'development' || process.env.SEED_DATABASE === 'true') {
    console.log('Seeding database...');
    await seedDatabase();
  }
};

// Call database initialization
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up file upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../server/public/uploads/payments'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `payment-${Date.now()}${ext}`);
  }
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Add upload middleware to request
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Request logger for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Static files
app.use(express.static(path.join(__dirname, '../../client/build')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({
    status: 'success',
    message: 'ODRS API is running',
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/payments', require('./routes/payments'));

// API Status route for health checks
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'ODRS API is running',
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// For any routes that doesn't match API routes, serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Server is available at https://${process.env.DOMAIN || 'odocs.devapp.cc'}`);
  } else {
    console.log(`Server is available at http://localhost:${PORT}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});