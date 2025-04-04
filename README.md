# Online Document Request System (ODRS)

A comprehensive solution for managing document requests in educational institutions. This system allows students and staff to request official documents, track their requests, and receive notifications at each step of the process.

## Document Request Feature Update

We've recently implemented the Document Request Submission feature, which includes:

1. A React frontend component for creating document requests
2. Backend API endpoints for:
   - Listing available document types
   - Creating new document requests
   - Retrieving document request details
   - Listing a user's document requests
3. Role-based access control for document requests
4. Pricing calculation based on document type, quantity, and delivery method

## Features

- User authentication and authorization with different roles (student, staff, approver, admin)
- Bilingual interface (Thai/English)
- Multiple document types with configurable pricing
- Multi-level approval workflow (advisor → department head → dean → registrar)
- Multiple delivery options (pickup, mail, digital)
- Payment verification
- Request tracking and notifications
- Admin dashboard with analytics
- Mobile-responsive design

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Material UI
- **Database**: PostgreSQL (with SQLite fallback for development)
- **Server**: Ubuntu 22.0 with NGINX

## Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL (v12 or later) - Optional, can use SQLite for development
- NGINX
- Let's Encrypt Certbot (for SSL)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/odrs.git
cd odrs
```

2. Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=5000
NODE_ENV=production
BASE_URL=https://odocs.devapp.cc
API_URL=https://odocs.devapp.cc/api

# Domain configuration
DOMAIN=odocs.devapp.cc

# Database configuration
DB_HOST=remote.devapp.cc
DB_USER=odrs_user
DB_PASSWORD=odrs_password
DB_NAME=odrs_db
DB_PORT=5432
USE_SQLITE=false

# JWT Secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=24h

# Email configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASS=emailpassword
EMAIL_FROM=noreply@example.com
```

3. Set up the PostgreSQL database:

```bash
# Run the database setup script
./setup-database.sh
```

This script will:
- Check if PostgreSQL client is installed
- Create the database and user on the PostgreSQL server
- Configure environment variables
- Run database migrations
- Seed the database with initial data including test accounts

4. Run the deployment script:

```bash
./deploy.sh
```

The script will:
- Install all dependencies
- Build the frontend
- Configure NGINX
- Set up SSL with Let's Encrypt
- Create PostgreSQL database if available
- Start the application with PM2

After running the script, your application will be available at https://odocs.devapp.cc

## Development

### Using PostgreSQL

For development with PostgreSQL database:

```bash
npm run dev
```

This will start both the backend server and the React development server with hot reloading.

### Using SQLite (No PostgreSQL required)

For development without PostgreSQL, you can use SQLite in-memory database:

```bash
npm run dev:sqlite
```

Or to start just the backend with SQLite:

```bash
npm run start:sqlite
```

### Initialize Database with Test Data

To initialize the database with test data:

```bash
npm run start:init
```

This will create test users with the following credentials:

- **Admin**: admin@odocs.devapp.cc / admin123
- **Staff**: staff@odocs.devapp.cc / staff123
- **Student**: student@odocs.devapp.cc / student123
- **Approvers**:
  - advisor@odocs.devapp.cc / approver123
  - department_head@odocs.devapp.cc / approver123
  - dean@odocs.devapp.cc / approver123
  - registrar@odocs.devapp.cc / approver123

## Project Structure

```
odrs/
├── client/             # React frontend
│   ├── public/         # Static files
│   └── src/            # React source code
│       ├── components/ # Reusable components
│       ├── context/    # Context providers
│       ├── pages/      # Page components
│       └── utils/      # Utility functions
├── server/             # Express backend
│   ├── public/         # Public files (uploads)
│   └── src/            # Server source code
│       ├── config/     # Configuration files
│       ├── controllers/# Request controllers
│       ├── middleware/ # Custom middleware
│       ├── models/     # Database models
│       ├── routes/     # API routes
│       └── utils/      # Utility functions
├── nginx/              # NGINX configuration
├── server-static.js    # Simple static server for fallback
├── init-server.js      # Initialize and run the server with database seeding
├── deploy.sh           # Deployment script
└── docs/               # Documentation
```

## Available Scripts

- `npm run server`: Start the backend server with nodemon
- `npm run client`: Start the React development server
- `npm run dev`: Start both backend and frontend in development mode
- `npm run dev:sqlite`: Start development mode with SQLite database
- `npm run build`: Build the React frontend for production
- `npm run start`: Start the production server
- `npm run start:sqlite`: Start the production server with SQLite
- `npm run start:init`: Initialize the database and start the server
- `npm run seed`: Seed the database with sample data

## Fallback Mode

If the main server fails to connect to the database, it will automatically fall back to using a SQLite database. For development and testing without any database, we provide a simplified static server implementation:

```bash
# Start the static server (from project root)
node server-static.js

# In a separate terminal, start the React frontend with static API integration
cd client
npm run start:static
```

This static server implements the core functionality:
- User authentication with test accounts
- Document type listing
- Document request creation and retrieval
- Role-based access controls

The static server runs on port 5002 and provides a simplified API that matches the structure of the full backend.

## License

[MIT](LICENSE)

## Contact

For any questions or feedback, please contact [admin@odocs.devapp.cc](mailto:admin@odocs.devapp.cc)