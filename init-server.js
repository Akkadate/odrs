#!/usr/bin/env node

/**
 * Initialize and run the ODRS server
 * This script is used to initialize the database and start the server
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.SEED_DATABASE = 'true';
process.env.PORT = '5001'; // Change port to 5001

// Check if the uploads directory exists, create if not
const uploadsDir = path.join(__dirname, 'server/public/uploads/payments');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Log function with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Install dependencies if node_modules doesn't exist
const serverNodeModulesPath = path.join(__dirname, 'server/node_modules');
if (!fs.existsSync(serverNodeModulesPath)) {
  log('Installing server dependencies...');
  const npmInstallServer = spawn('npm', ['install'], { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  
  npmInstallServer.on('close', (code) => {
    if (code !== 0) {
      log(`Server npm install failed with code ${code}`);
      process.exit(1);
    }
    log('Server dependencies installed successfully');
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  log('Starting ODRS server...');
  
  // Start server with proper error handling
  const server = spawn('node', ['src/index.js'], { 
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    env: { ...process.env, USE_SQLITE: 'true', PORT: '5001' }
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      log(`Server process exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      log(`Received ${signal}, shutting down gracefully`);
      server.kill(signal);
    });
  });
}