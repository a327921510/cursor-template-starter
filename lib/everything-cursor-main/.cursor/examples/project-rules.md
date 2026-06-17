# Example Project Rules

This is an example project-level rules file.
Copy to your project's `.cursor/rules/` directory and customize.

## Project Overview

[Brief description of your project - what it does, tech stack]

**Tech Stack:**
- Frontend: Next.js 14, React, TypeScript
- Backend: Node.js, Express
- Database: PostgreSQL, Prisma
- Cache: Redis

## Critical Rules

### 1. Code Organization
- Many small files over few large files
- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Organize by feature/domain

### 2. Code Style
- Immutability always - never mutate objects
- No console.log in production
- Proper error handling with try/catch
- Input validation with Zod

### 3. Testing
- TDD: Write tests first
- 80% minimum coverage
- Unit tests for utilities
- Integration tests for APIs
- E2E tests for critical flows

### 4. Security
- No hardcoded secrets
- Environment variables for sensitive data
- Validate all user inputs
- Parameterized queries only

## File Structure

```
src/
├── app/              # Next.js app router
├── components/       # Reusable UI components
├── features/         # Feature modules
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── services/         # API services
└── types/            # TypeScript definitions
```

## Key Patterns

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### Error Handling
```typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'User-friendly message' }
}
```

## Environment Variables

```bash
# Required
DATABASE_URL=
API_KEY=

# Optional
DEBUG=false
LOG_LEVEL=info
```

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`
- Never commit to main directly
- PRs require review
- All tests must pass before merge
