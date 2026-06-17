# Coding Standards Skill

Enforced code quality standards and patterns for production TypeScript/JavaScript projects.

## When to Use

This skill is always relevant when writing or reviewing code. It defines the non-negotiable quality baseline.

---

## 1. Core Principles

### Immutability — NEVER Mutate

```typescript
// ❌ MUTATION — causes hidden bugs, breaks React rendering, ruins debugging
const users = [{ id: 1, name: 'Alice' }]
users.push({ id: 2, name: 'Bob' })         // mutates array
users[0].name = 'Alicia'                     // mutates object

// ✅ IMMUTABLE — predictable, traceable, safe
const added = [...users, { id: 2, name: 'Bob' }]
const updated = users.map(u => u.id === 1 ? { ...u, name: 'Alicia' } : u)
const removed = users.filter(u => u.id !== 1)

// For deep updates, use structured spread or immer:
const deepUpdate = {
  ...state,
  user: {
    ...state.user,
    address: { ...state.user.address, city: 'New York' }
  }
}
```

### Single Responsibility — One Reason to Change

```typescript
// ❌ GOD FUNCTION: validates, transforms, persists, notifies
async function handleUserRegistration(req: Request) {
  // 80+ lines doing everything...
}

// ✅ DECOMPOSED: each function does one thing
async function handleUserRegistration(req: Request) {
  const input = validateRegistrationInput(req.body)  // validate
  const user = await createUser(input)                // persist
  await sendWelcomeEmail(user.email)                  // notify
  return formatUserResponse(user)                     // transform
}
```

---

## 2. Naming Conventions

### Variables and Functions

```typescript
// Boolean: use is/has/can/should prefix — reads like English
const isActive = true
const hasPermission = user.role === 'admin'
const canEdit = hasPermission && !isLocked
const shouldRetry = attempts < MAX_RETRIES

// Functions: verb + noun — describes the action
function getUserById(id: string): Promise<User> {}
function calculateOrderTotal(items: OrderItem[]): number {}
function formatCurrency(amount: number, locale: string): string {}

// Event handlers: handle + Event
function handleSubmit(event: FormEvent) {}
function handleUserCreated(user: User) {}

// Avoid: vague names, abbreviations, single letters (except loops)
// ❌ data, info, temp, val, res, cb, fn, idx
// ✅ userData, connectionInfo, temporaryToken, responseBody
```

### Types and Interfaces

```typescript
// Types: PascalCase, descriptive, no I- prefix
type UserId = string
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered'

interface User {
  id: UserId
  email: string
  createdAt: Date
}

// Input/Output types: suffix with Input/Output or Request/Response
interface CreateUserInput {
  email: string
  name: string
}

interface CreateUserResponse {
  user: User
  token: string
}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const DEFAULT_PAGE_SIZE = 20
const API_TIMEOUT_MS = 10_000
```

---

## 3. TypeScript Strictness

### Zero Tolerance for `any`

```typescript
// ❌ NEVER: any throws away all type safety
function process(data: any) { return data.value }

// ✅ Use unknown + type narrowing
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value)
  }
  throw new Error('Invalid data structure')
}

// ✅ Use generics for flexible but safe functions
function first<T>(items: T[]): T | undefined {
  return items[0]
}

// ✅ Use Zod for runtime validation of external data
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
})
type User = z.infer<typeof UserSchema>

function parseUser(data: unknown): User {
  return UserSchema.parse(data)  // throws ZodError if invalid
}
```

### Null Safety

```typescript
// ❌ Unchecked access — runtime crash
function getUserName(user: User | null) {
  return user.name  // TypeError if null
}

// ✅ Early return pattern
function getUserName(user: User | null): string {
  if (!user) return 'Unknown'
  return user.name
}

// ✅ Optional chaining + nullish coalescing
const city = user?.address?.city ?? 'Not provided'

// ✅ Exhaustive type checking with never
type Status = 'active' | 'inactive' | 'banned'
function getStatusLabel(status: Status): string {
  switch (status) {
    case 'active': return 'Active'
    case 'inactive': return 'Inactive'
    case 'banned': return 'Banned'
    default: {
      const _exhaustive: never = status
      throw new Error(`Unhandled status: ${_exhaustive}`)
    }
  }
}
```

---

## 4. Error Handling Standards

### Every Async Call Must Be Handled

```typescript
// ❌ Unhandled promise — silent failure
async function loadData() {
  const response = await fetch('/api/users')
  const data = await response.json()
  return data
}

// ✅ Check response status + wrap in Result
async function loadData(): Promise<Result<User[]>> {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
    const data = await response.json()
    return { success: true, data: UserArraySchema.parse(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
```

### Result Type Over Exceptions (for expected failures)

```typescript
// Use exceptions for UNEXPECTED errors (bugs, infra failures)
// Use Result type for EXPECTED failures (not found, validation, business rules)

type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E }

// ✅ Caller is FORCED to handle both paths
const result = await userService.getUser(id)
if (!result.success) {
  return res.status(404).json({ error: result.error })
}
// result.data is now safely typed as User
```

---

## 5. File & Function Size Limits

### Hard Limits

```
Function: ≤ 50 lines (if longer, decompose)
File:     ≤ 800 lines (if longer, split by responsibility)
Nesting:  ≤ 4 levels (if deeper, extract or use early returns)
Parameters: ≤ 4 (if more, use an options object)
```

### Reducing Nesting

```typescript
// ❌ Deep nesting — hard to read
function processOrder(order: Order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        for (const item of order.items) {
          if (item.quantity > 0) {
            // actual logic buried 5 levels deep
          }
        }
      }
    }
  }
}

// ✅ Guard clauses — flat and readable
function processOrder(order: Order) {
  if (!order) throw new Error('Order is required')
  if (order.items.length === 0) return
  if (order.status !== 'pending') return

  const validItems = order.items.filter(item => item.quantity > 0)
  validItems.forEach(item => processItem(item))
}
```

---

## 6. Import Organization

```typescript
// Group imports in this order, separated by blank lines:

// 1. Node built-ins
import path from 'node:path'
import { readFile } from 'node:fs/promises'

// 2. External packages
import { z } from 'zod'
import express from 'express'

// 3. Internal aliases (@/ paths)
import { UserService } from '@/services/user-service'
import { db } from '@/lib/database'

// 4. Relative imports
import { validateInput } from './validators'
import type { User } from './types'

// RULES:
// - Use type-only imports: import type { X } from '...'
// - No circular imports (A imports B imports A)
// - No barrel re-exports that pull in the entire module
```

---

## 7. Code Smells to Reject

```typescript
// ❌ Magic numbers
if (password.length < 8) {}           // What is 8?
// ✅
const MIN_PASSWORD_LENGTH = 8
if (password.length < MIN_PASSWORD_LENGTH) {}

// ❌ Boolean parameters
createUser(email, name, true, false)  // What do true/false mean?
// ✅ Options object
createUser({ email, name, sendWelcome: true, isAdmin: false })

// ❌ Commented-out code — use git history
// function oldImplementation() { ... }
// ✅ Delete it. Git remembers.

// ❌ console.log in production
console.log('user data:', user)
// ✅ Structured logger
logger.info('User created', { userId: user.id })
```
