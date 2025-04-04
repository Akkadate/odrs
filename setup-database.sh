#!/bin/bash
# ODRS PostgreSQL Database Setup Script

# Database Configuration
DB_HOST="remote.devapp.cc"
DB_PORT=5432
DB_NAME="odrs_db"
DB_USER="odrs_user"
DB_PASSWORD="odrs_password"  # In production, use a secure password

echo "Setting up PostgreSQL database for ODRS..."

# Check if PostgreSQL client is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL client is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y postgresql-client
fi

# Create database and user
echo "Creating database and user..."

# Connect to PostgreSQL and run SQL commands
psql -h $DB_HOST -p $DB_PORT -U postgres << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# Check if the operation was successful
if [ $? -eq 0 ]; then
    echo "Database and user created successfully."
else
    echo "Error creating database and user. Please check your PostgreSQL connection and credentials."
    exit 1
fi

# Create .env file with database configuration
echo "Creating .env file with database configuration..."
cat > /var/www/app/odocs/odrs/.env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Node Environment
NODE_ENV=development

# JWT Secret for Authentication
JWT_SECRET=odrs_jwt_secret_key

# Server Port
PORT=5000

# Use PostgreSQL (set to false to use SQLite)
USE_SQLITE=false
EOF

# Also create .env in server directory
cp /var/www/app/odocs/odrs/.env /var/www/app/odocs/odrs/server/.env

echo "Environment variables configured."

# Run database migrations
echo "Setting up database schema..."
cd /var/www/app/odocs/odrs/server
npm run db:migrate

echo "ODRS database setup complete!"
echo "-------------------------------------------------------------------------"
echo "Database Host: $DB_HOST"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "-------------------------------------------------------------------------"
echo "You can now start the ODRS application with: npm run server"