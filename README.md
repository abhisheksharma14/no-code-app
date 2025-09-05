# 🏦 Maersk Bank - Digital Banking API

> **Vibe Coding: Build with AI** — A comprehensive digital banking application built with Next.js, featuring full CRUD operations, JWT authentication, and modern UI components.

## 🚀 Overview

This is a fictional digital banking application for Maersk Bank that enables users to:
- Create and manage personal accounts
- Secure authentication with JWT tokens
- Update personal information
- Delete accounts (with bank account restrictions)
- Modern, responsive frontend interface

**Built with AI-assisted development** using tools like GitHub Copilot to accelerate development and explore the boundaries of AI-powered coding.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod schemas
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **API**: RESTful API routes

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/v1/
│   │   ├── auth/login/          # Authentication endpoints
│   │   └── users/               # User CRUD operations
│   ├── dashboard/               # User dashboard page
│   └── page.tsx                 # Landing page
├── components/
│   ├── auth/                    # Authentication components
│   ├── dashboard/               # Dashboard components
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── auth.ts                  # JWT & password utilities
│   ├── db.ts                    # Database connection
│   ├── errors.ts                # Error handling utilities
│   └── validations.ts           # Zod validation schemas
└── types/
    └── user.ts                  # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd maersk-bank-api
   npm install
   ```

2. **Environment setup:**
   ```bash
   # Copy .env file
   cp .env .env.local
   
   # Update .env.local with your JWT secret
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

3. **Database setup:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 🔐 Authentication

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "hasBankAccount": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 👤 User Management

**Create User**
```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",      // optional
  "address": "123 Main St",           // optional
  "dateOfBirth": "1990-01-01T00:00:00.000Z", // optional
  "password": "password123"
}
```

**Get User**
```http
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

**Update User**
```http
PATCH /api/v1/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1987654321",
  "address": "456 Oak Ave",
  "dateOfBirth": "1985-05-15T00:00:00.000Z"
}
```

**Delete User**
```http
DELETE /api/v1/users/{userId}
Authorization: Bearer <token>
```

### Error Responses

All error responses follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

**Status Codes:**
- `400` - Bad Request (validation errors, missing data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (accessing other user's data)
- `404` - Not Found (user doesn't exist)
- `409` - Conflict (cannot delete user with bank account)
- `500` - Internal Server Error

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
__tests__/
├── api/
│   ├── users.test.ts           # API route tests
│   └── auth.test.ts            # Authentication tests
├── components/
│   ├── LoginForm.test.tsx      # Component tests
│   └── SignupForm.test.tsx
└── lib/
    ├── auth.test.ts            # Utility function tests
    └── validations.test.ts
```

## 🗄️ Database

### Schema

```sql
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  firstName       String
  lastName        String
  phoneNumber     String?
  address         String?
  dateOfBirth     DateTime?
  password        String
  hasBankAccount  Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("users")
}
```

### Useful Commands
```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Reset database
npx prisma db push --force-reset

# View database
sqlite3 prisma/dev.db
```

## 🌟 Features Implemented

### ✅ Core Requirements
- [x] **User Creation**: POST `/v1/users` with validation
- [x] **User Authentication**: JWT-based login system
- [x] **User Retrieval**: GET `/v1/users/{userId}` with authorization
- [x] **User Updates**: PATCH `/v1/users/{userId}` with validation
- [x] **User Deletion**: DELETE `/v1/users/{userId}` with bank account check
- [x] **Error Handling**: Proper HTTP status codes for all scenarios
- [x] **Authorization**: Users can only access their own data

### ✅ Additional Features
- [x] **Modern UI**: React components with Tailwind CSS
- [x] **Form Validation**: Client and server-side validation
- [x] **Testing Suite**: Unit and integration tests
- [x] **Type Safety**: Full TypeScript implementation
- [x] **Security**: Password hashing with bcryptjs
- [x] **Documentation**: Comprehensive API docs

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **Authorization**: User can only access own data
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Docker
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤖 AI-Assisted Development

This project showcases the power of AI-assisted development:

- **GitHub Copilot**: Used extensively for code generation
- **AI-Generated Components**: React components and API routes
- **Automated Testing**: AI-assisted test case generation
- **Documentation**: AI-helped comprehensive documentation

**Goal**: Push the boundaries of what's possible with AI collaboration in modern web development.

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ using AI-assisted development**
