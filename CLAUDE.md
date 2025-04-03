# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: ODRS (Online Document Request System)

### Technology Stack
- Backend: Node.js with Express
- Frontend: React
- Database: PostgreSQL (host: remote.devapp.cc)
- Server: Ubuntu 22.0 with NGINX

### Build/Test Commands
```bash
# Install dependencies
npm install

# Run backend server
npm run server

# Run frontend development server
npm run dev

# Build frontend for production
npm run build

# Run all tests
npm test

# Run single test
npx jest path/to/test.js

# Run linting
npm run lint
```

### Code Style Guidelines
- Follow ESLint and Prettier configurations
- Use 2 spaces for indentation
- Use camelCase for variables and functions, PascalCase for components
- Prefer functional components with hooks in React
- Add PropTypes or TypeScript interfaces for component props
- Handle API errors and loading states consistently
- Store sensitive information in environment variables
- Implement responsive design for all frontend components
- Support bilingual interface (Thai/English)
- Follow REST principles for API endpoints