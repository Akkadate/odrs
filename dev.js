/**
 * Development server script
 * This script is used to run the application in development mode
 * with automatic database initialization and seeding
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.SEED_DATABASE = 'true';
process.env.USE_SQLITE = process.env.USE_SQLITE || 'true';

// Log function with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'server/public/uploads/payments');
if (!fs.existsSync(uploadsDir)) {
  log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Install server dependencies if needed
const serverNodeModulesPath = path.join(__dirname, 'server/node_modules');
if (!fs.existsSync(serverNodeModulesPath)) {
  log('Installing server dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
}

// Start server with nodemon for development
log('Starting server in development mode...');
const server = spawn('nodemon', ['server/src/index.js'], { 
  stdio: 'inherit',
  env: { 
    ...process.env, 
    PORT: '5000',
    NODE_ENV: 'development',
    USE_SQLITE: 'true',
    SEED_DATABASE: 'true'
  }
});

// Handle termination signals
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    log(`Received ${signal}, shutting down gracefully`);
    server.kill(signal);
    process.exit(0);
  });
});

// Log server exit
server.on('close', (code) => {
  log(`Server process exited with code ${code}`);
  process.exit(code);
});