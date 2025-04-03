#!/bin/bash

# ODRS Deployment Script
echo "Starting ODRS deployment..."

# Install dependencies
echo "Installing dependencies..."
npm run install-all

# Build the React frontend
echo "Building frontend..."
npm run build

# Create uploads directory if it doesn't exist
echo "Setting up upload directories..."
mkdir -p server/public/uploads/payments

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 server/public/uploads

# Configure NGINX
echo "Setting up NGINX configuration..."
if [ -f /etc/nginx/sites-available/odocs.devapp.cc ]; then
    echo "NGINX configuration already exists. Skipping..."
else
    echo "Creating NGINX configuration..."
    sudo cp nginx/odocs.devapp.cc.conf /etc/nginx/sites-available/odocs.devapp.cc
    sudo ln -s /etc/nginx/sites-available/odocs.devapp.cc /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# Setup SSL with Let's Encrypt
echo "Setting up SSL certificate..."
if [ -d /etc/letsencrypt/live/odocs.devapp.cc ]; then
    echo "SSL certificate already exists. Skipping..."
else
    echo "Requesting SSL certificate..."
    sudo certbot --nginx -d odocs.devapp.cc --non-interactive --agree-tos --email admin@devapp.cc
fi

# Determine which script to use based on database availability
# Check PostgreSQL connectivity first
echo "Checking database connectivity..."
if pg_isready -h ${DB_HOST:-remote.devapp.cc} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} > /dev/null 2>&1; then
    echo "PostgreSQL connection successful. Using main server."
    USE_SQLITE=false
    SCRIPT_CMD="npm start"
    ENV_VARS="NODE_ENV=production"
else
    echo "PostgreSQL connection failed. Using SQLite database."
    USE_SQLITE=true
    SCRIPT_CMD="npm run start:sqlite"
    ENV_VARS="USE_SQLITE=true NODE_ENV=production"
fi

# Install PM2 globally if not already installed
echo "Setting up PM2..."
if command -v pm2 &> /dev/null; then
    echo "PM2 already installed. Proceeding..."
else
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start or restart the application with PM2
echo "Starting application with PM2..."
if [ "$USE_SQLITE" = true ]; then
    # Using SQLite - try the main server first, fallback to static
    if pm2 list | grep -q "odrs"; then
        echo "Stopping existing PM2 process..."
        pm2 stop odrs
        pm2 delete odrs
    fi
    
    echo "Starting server with SQLite..."
    pm2 start server/src/index.js --name odrs --env "USE_SQLITE=true NODE_ENV=production" || {
        echo "Main server failed. Starting static server as fallback..."
        pm2 start server-static.js --name odrs --env "NODE_ENV=production"
    }
else
    # Using PostgreSQL
    if pm2 list | grep -q "odrs"; then
        echo "Restarting application..."
        pm2 restart odrs --update-env
    else
        echo "Starting application for the first time..."
        pm2 start $SCRIPT_CMD --name odrs --env "$ENV_VARS"
    fi
fi

# Save PM2 configuration and set up startup
pm2 save
pm2 startup

echo "Deployment completed successfully!"
echo "Your application is now available at https://odocs.devapp.cc"

# Print test accounts if running with SQLite
if [ "$USE_SQLITE" = true ]; then
    echo ""
    echo "==== TEST ACCOUNTS ===="
    echo "Admin: admin@odocs.devapp.cc / admin123"
    echo "Staff: staff@odocs.devapp.cc / staff123"
    echo "Student: student@odocs.devapp.cc / student123"
    echo "======================="
fi