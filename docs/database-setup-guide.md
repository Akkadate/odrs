# ODRS PostgreSQL Database Setup Guide

This guide explains how to set up and configure the PostgreSQL database for the Online Document Request System (ODRS).

## Prerequisites

Before setting up the database, ensure you have:

- PostgreSQL server (v12 or later) installed and running
- PostgreSQL client tools installed 
- Node.js and npm installed

## Database Setup Steps

### 1. Install PostgreSQL Dependencies

First, install the required PostgreSQL client and Node.js dependencies:

```bash
# Run from the project root
npm run db:install-deps
```

This script will:
- Install the PostgreSQL client if on a Debian/Ubuntu system
- Install the necessary Node.js packages (`pg`, `pg-hstore`, `sequelize-cli`)

### 2. Set Up Environment Variables

Ensure your `.env` file contains the following database-related variables:

```
# Database Configuration
DB_HOST=remote.devapp.cc
DB_PORT=5432
DB_NAME=odrs_db
DB_USER=odrs_user
DB_PASSWORD=odrs_password
USE_SQLITE=false
```

Modify the values to match your PostgreSQL server configuration.

### 3. Create and Configure the Database

Run the database setup script:

```bash
# Run from the project root
npm run db:setup
```

This script will:
- Create the `odrs_db` database on your PostgreSQL server
- Create the `odrs_user` user with the specified password
- Grant necessary permissions to the user
- Run database migrations to create all required tables

### 4. Seed the Database with Initial Data

Populate the database with initial data (test users, document types, etc.):

```bash
# Run from the project root
npm run db:seed
```

### 5. Test the Database Connection

Verify that the application can connect to the database:

```bash
# Run from the project root
npm run db:test
```

If successful, this will show a list of tables in the database and confirm the connection.

## Database Management Commands

The following commands are available for managing the database:

- `npm run db:test` - Test the database connection
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database with initial data
- `npm run db:reset` - Reset and recreate the database (drop tables, run migrations, seed data)

## Switching Between PostgreSQL and SQLite

The ODRS can use either PostgreSQL (recommended for production) or SQLite (for development):

- To use PostgreSQL: Set `USE_SQLITE=false` in your `.env` file
- To use SQLite: Set `USE_SQLITE=true` in your `.env` file

For development with SQLite, you can also run:

```bash
npm run dev:sqlite
```

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check that PostgreSQL is running
2. Verify the database host, port, username, and password in your `.env` file
3. Ensure the PostgreSQL server allows connections from your application's host
4. Check if PostgreSQL requires SSL connections (set in the connection configuration)

### Migration Issues

If migrations fail:

1. Check the error messages in the console
2. Ensure your PostgreSQL user has sufficient privileges to create tables
3. Try resetting the database: `npm run db:reset`

### Schema Mismatch

If you see errors about missing tables or columns:

1. Run `npm run db:migrate` to update the database schema
2. If problems persist, try `npm run db:reset` to rebuild the database

## Database Structure

The ODRS database includes the following main tables:

- `Users` - User accounts and profile information
- `DocumentTypes` - Available document types and their properties
- `Requests` - Document requests submitted by users
- `Approvals` - Approval records for document requests
- `Payments` - Payment records for document requests
- `Notifications` - System notifications for users