#!/bin/bash
# ODRS Database Reset Script

echo "Resetting ODRS database..."

# 1. Drop the database
echo "Dropping database..."
cd /var/www/app/odocs/odrs/server
npx sequelize-cli db:drop

# 2. Create the database
echo "Creating database..."
npx sequelize-cli db:create

# 3. Run migrations
echo "Running migrations..."
npx sequelize-cli db:migrate

# 4. Seed the database
echo "Seeding database..."
npx sequelize-cli db:seed:all

echo "Database reset complete."