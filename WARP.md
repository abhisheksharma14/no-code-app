# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
# Initial setup
npm install
npm run db:generate     # Generate Prisma client
npm run db:push         # Apply database schema

# Environment setup (copy and modify .env.local)
cp .env .env.local
```

### Development Server
```bash
npm run dev             # Start development server (http://localhost:3000)
```

### Database Management
```bash
npm run db:studio       # Open Prisma Studio GUI
npm run db:push         # Push schema changes to database
npm run db:generate     # Regenerate Prisma client after schema changes

# Database debugging
sqlite3 prisma/dev.db   # Direct SQLite access
npx prisma db push --force-reset  # Reset database (destructive)
```

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report

# Run specific test file
npm test -- __tests__/api/users.test.ts
```

### Building and Deployment
```bash
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Prisma ORM (custom client output: `src/generated/prisma`)
- **Authentication**: JWT with bcryptjs (24h token expiry)
- **Validation**: Zod schemas with comprehensive error handling
- **Testing**: Jest + React Testing Library + node-mocks-http for API testing

### API Architecture
This is a RESTful API with versioned endpoints under `/api/v1/`:

- **Authentication**: `POST /api/v1/auth/login`
- **Users**: CRUD operations at `/api/v1/users` and `/api/v1/users/[userId]`

### Key Architectural Patterns

#### Authorization Strategy
- JWT tokens required for all user operations (except registration/login)
- Users can only access their own data (enforced in route handlers)
- Custom `getTokenFromHeader()` utility for consistent token extraction

#### Database Layer
- Single `User` model with optional fields for flexibility
- Custom Prisma client location: `src/generated/prisma` 
- `hasBankAccount` field prevents user deletion (business logic constraint)

#### Validation Strategy
- Separate Zod schemas for different operations:
  - `createUserSchema`: User registration
  - `updateUserSchema`: Profile updates (all fields optional)
  - `loginSchema`: Authentication
  - `userIdSchema`: Route parameter validation
- Centralized validation error handling in `lib/errors.ts`

#### Security Measures
- Password hashing with bcryptjs (12 salt rounds)
- SQL injection protection via Prisma ORM
- Input sanitization through Zod validation

### Directory Structure Conventions

```
src/
├── app/
│   ├── api/v1/           # Versioned API routes
│   │   ├── auth/login/   # Authentication endpoint
│   │   └── users/        # User CRUD operations
│   ├── dashboard/        # User dashboard UI
│   └── page.tsx          # Landing page
├── lib/                  # Shared utilities
│   ├── auth.ts           # JWT & password utilities
│   ├── db.ts             # Prisma client instance
│   ├── errors.ts         # Error handling utilities
│   └── validations.ts    # Zod schemas
└── types/
    └── user.ts           # TypeScript definitions
```

### Testing Conventions
- API routes tested with `node-mocks-http` for HTTP mocking
- Database operations use the actual SQLite database (not mocked)
- Test files mirror source structure in `__tests__/` directory
- Coverage excludes generated files (`src/generated/**/*`)

### Environment Configuration
- `JWT_SECRET`: Required for token signing/verification
- `DATABASE_URL`: SQLite connection string (defaults to `prisma/dev.db`)
- Development uses `.env.local` file (not tracked in git)

### Business Logic Notes
- Users with `hasBankAccount: true` cannot be deleted (returns 409 Conflict)
- Email addresses must be unique across all users
- Password minimum length: 8 characters
- JWT tokens expire after 24 hours

### AI-Assisted Development Context
This project was built with extensive AI assistance (GitHub Copilot). The codebase follows modern TypeScript patterns and includes comprehensive error handling suitable for production use.

