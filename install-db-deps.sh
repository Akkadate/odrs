#!/bin/bash
# ODRS PostgreSQL Dependencies Installation Script

echo "Installing PostgreSQL dependencies for ODRS..."

# Check if we're running on a Debian/Ubuntu system
if [ -f /etc/debian_version ]; then
    echo "Detected Debian/Ubuntu system."
    
    # Install PostgreSQL client
    echo "Installing PostgreSQL client..."
    sudo apt-get update
    sudo apt-get install -y postgresql-client

    # Install Node.js PostgreSQL dependencies
    echo "Installing Node.js PostgreSQL dependencies..."
    npm install pg pg-hstore --save
    cd server && npm install pg pg-hstore sequelize-cli --save && cd ..
    
    echo "PostgreSQL dependencies installed successfully."
else
    # For other systems (macOS, etc.)
    echo "Non-Debian/Ubuntu system detected."
    
    # For macOS, suggest using Homebrew
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "For macOS, we recommend installing PostgreSQL client with Homebrew:"
        echo "  brew install postgresql"
    else
        echo "Please install the PostgreSQL client package for your system."
    fi
    
    # Install Node.js PostgreSQL dependencies anyway
    echo "Installing Node.js PostgreSQL dependencies..."
    npm install pg pg-hstore --save
    cd server && npm install pg pg-hstore sequelize-cli --save && cd ..
    
    echo "Node.js PostgreSQL dependencies installed successfully."
fi

echo "ODRS PostgreSQL dependencies installation complete."
echo "You can now run './setup-database.sh' to set up the database."