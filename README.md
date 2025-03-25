# RExpense User Service

![NestJS](https://img.shields.io/badge/NestJS-8.x-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.x-orange.svg)
![Swagger](https://img.shields.io/badge/Swagger-3.x-green.svg)

A secure, robust user authentication and management microservice for the RExpense application. Built with NestJS, this service implements industry-standard security practices and provides a comprehensive set of user management features.

## Features

- **Secure Authentication**
  - JWT-based authentication
  - Session management with refresh tokens
  - Password hashing with bcrypt

- **Enhanced Security**
  - Rate limiting to protect against brute force attacks
  - Password reset with secure OTP generation
  - Helmet for HTTP header security
  - Email notifications for critical security events

- **User Management**
  - User registration and login
  - Profile management
  - Role-based access control

- **API Documentation**
  - Swagger UI for easy API exploration
  - Comprehensive request/response documentation

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT
- **Email**: SendGrid
- **Documentation**: Swagger
- **Security**: Helmet, ThrottlerModule
- **Validation**: class-validator

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/NanobyteRuata/user_service.git
cd user_service
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (create a `.env` file)
```env
#APP
PORT=3000

# JWT
JWT_ACCESS_SECRET=JWT_ACCESS_SECRET
JWT_ACCESS_EXPIRE_IN=15m
JWT_REFRESH_SECRET=JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRE_IN=7d

# DATABASE
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=root
DB_PASSWORD=pass
DB_DATABASE=postgres
DB_SYNCHRONIZE=true #false in prod

#EMAIL SENDGRID
SENDGRID_API_KEY=SENDGRID_API_KEY
SENDGRID_FROM_EMAIL=SENDGRID_FROM_EMAIL
```

4. Start the application
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

The API documentation is available at `/swagger` when the application is running.

### Endpoints

- **Authentication**
  - `POST /auth/register` - Register a new user
  - `POST /auth/login` - Login a user
  - `POST /auth/refresh` - Refresh an access token
  - `POST /auth/logout` - Logout a user
  - `POST /auth/forgot-password` - Request a password reset
  - `POST /auth/reset-password` - Reset password with token

- **Session**
  - `GET /sessions` - Get all sessions with pagination
  - `POST /sessions/end-session` - End user sessions

- **Users**
  - `GET /users` - Get all users with pagination
  - `GET /users/${id}` - Get user profile
  - `PATCH /users/${id}` - Update user profile
  - `DELETE /users/${id}` - Soft delete user
  - `DELETE /users/${id}/hard-delete` - Hard delete user

## Security Features

### Password Reset Flow
The service implements a secure password reset flow:
1. User requests a password reset with their email
2. System generates a secure token and sends an email with reset instructions
3. User submits token along with new password
4. System verifies token validity and expiration
5. Password is updated and all active sessions are terminated
6. User receives an email confirmation of the password change

### Rate Limiting
The application implements rate limiting to protect against brute force attacks:
- Global limit of 15 requests per minute for all endpoints
- Stricter limits on auth endpoints (5 requests per minute)

### Email Notifications
Users receive email notifications for critical security events:
- Password reset requests
- Successful password changes

## Development

### Code Style
The project uses ESLint and Prettier for code formatting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing

```bash
# Unit tests
npm run test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
