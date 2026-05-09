# Backend Patterns Skill

Deep backend architecture patterns for building production-grade server applications.

## When to Use

Activate this skill when:
- Designing API endpoints or services
- Making database schema decisions
- Implementing caching, queuing, or background jobs
- Setting up authentication/authorization architecture
- Structuring a backend project

---

## 1. API Design Patterns

### RESTful Resource Design

```typescript
// DECISION FRAMEWORK: Choose your API style
//
// REST   → CRUD-heavy, public APIs, caching-friendly
// GraphQL → Complex nested data, mobile clients, bandwidth-sensitive
// tRPC   → TypeScript monorepo, full-stack type safety
// gRPC   → Microservice-to-microservice, high performance

// REST Naming Convention:
// ✅ GET    /api/users          → List users
// ✅ POST   /api/users          → Create user
// ✅ GET    /api/users/:id      → Get single user
// ✅ PATCH  /api/users/:id      → Partial update
// ✅ DELETE /api/users/:id      → Delete user
// ✅ GET    /api/users/:id/orders → Nested resource
//
// ❌ GET /api/getUsers          → Verb in URL
// ❌ POST /api/users/create     → Redundant verb
// ❌ GET /api/user              → Singular for collection
```

### Layered Architecture (Handler → Service → Repository)

```typescript
// Layer 1: Handler — HTTP concerns ONLY
// - Parse request (params, body, query)
// - Call service
// - Format HTTP response
// - NO business logic here
async function createUserHandler(req: Request, res: Response) {
  const input = CreateUserSchema.parse(req.body)       // validate
  const result = await userService.createUser(input)    // delegate
  return res.status(201).json({ success: true, data: result })
}

// Layer 2: Service — Business logic ONLY
// - Orchestrate operations
// - Enforce business rules
// - Transaction boundaries
// - NO HTTP concepts, NO direct DB queries
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private eventBus: EventBus
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    await this.ensureEmailUnique(input.email)
    const user = await this.userRepo.create({
      ...input,
      password: await hashPassword(input.password),
    })
    await this.eventBus.publish('user.created', { userId: user.id })
    return user
  }
}

// Layer 3: Repository — Data access ONLY
// - Single table/entity operations
// - Query construction
// - NO business logic, NO cross-entity operations
class UserRepository {
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data })
  }
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }
}
```

### Standardized API Response

```typescript
// ALWAYS use a consistent envelope
interface ApiResponse<T> {
  success: true
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

interface ApiError {
  success: false
  error: {
    code: string          // machine-readable: "USER_NOT_FOUND"
    message: string       // human-readable: "User not found"
    details?: unknown     // validation errors, debug info (non-prod)
  }
}

// Pagination: cursor-based > offset-based for large datasets
// Cursor: GET /api/posts?cursor=abc123&limit=20
// Offset: GET /api/posts?page=2&pageSize=20 (ok for small sets)
```

---

## 2. Database Patterns

### Schema Design Decision Framework

```
When designing a table, answer these questions:
1. What are the access patterns? (Design for queries, not entities)
2. Will this be read-heavy or write-heavy?
3. What needs to be indexed? (Every WHERE/JOIN/ORDER BY column)
4. What are the relationships? (1:1, 1:N, M:N)
5. What data changes together? (Transaction boundaries)
```

### Migration Safety Rules

```typescript
// SAFE migrations (can run with zero downtime):
// ✅ Add new column with default value
// ✅ Add new table
// ✅ Add new index (CONCURRENTLY in PostgreSQL)
// ✅ Add nullable column

// UNSAFE migrations (require coordination):
// ⚠️ Rename column → Add new, backfill, update code, drop old
// ⚠️ Change column type → Two-phase migration
// ⚠️ Drop column → Remove all code references first
// ⚠️ Add NOT NULL without default → Backfill then alter

// PATTERN: Expand-and-Contract Migration
// Step 1: Add new column (nullable)
// Step 2: Backfill data from old column
// Step 3: Update code to write to both columns
// Step 4: Update code to read from new column
// Step 5: Drop old column
```

### N+1 Query Prevention

```typescript
// ❌ N+1 Problem: 1 query for users + N queries for posts
const users = await prisma.user.findMany()
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { authorId: user.id } })
}

// ✅ Eager loading: 1-2 queries total
const users = await prisma.user.findMany({
  include: { posts: { take: 10, orderBy: { createdAt: 'desc' } } }
})

// ✅ Dataloader pattern for GraphQL resolvers
const postLoader = new DataLoader(async (userIds: string[]) => {
  const posts = await prisma.post.findMany({
    where: { authorId: { in: userIds } }
  })
  return userIds.map(id => posts.filter(p => p.authorId === id))
})
```

---

## 3. Caching Strategy

### Cache Decision Matrix

```
┌─────────────────────────────────────────────────────────┐
│ When to cache:                                          │
│ ✅ Read-heavy, write-rare data (user profiles, configs) │
│ ✅ Expensive computations (aggregations, reports)       │
│ ✅ External API responses (rate-limited services)       │
│                                                         │
│ When NOT to cache:                                      │
│ ❌ Frequently changing data (real-time feeds)           │
│ ❌ User-specific sensitive data (without encryption)    │
│ ❌ Data where staleness causes correctness issues       │
└─────────────────────────────────────────────────────────┘

Cache Invalidation Strategy:
1. TTL (Time-to-Live) — simplest, use for most cases
2. Write-through — update cache on every write
3. Event-driven — invalidate on domain events
4. Versioned keys — append version to cache key
```

```typescript
// Multi-layer caching pattern
class CachedUserService {
  // L1: In-memory (per-process, fastest, small capacity)
  private memCache = new Map<string, { data: User; expiry: number }>()
  // L2: Redis (shared across processes, fast, large capacity)

  async getUser(id: string): Promise<User> {
    // L1 check
    const mem = this.memCache.get(id)
    if (mem && mem.expiry > Date.now()) return mem.data

    // L2 check
    const cached = await redis.get(`user:${id}`)
    if (cached) {
      const user = JSON.parse(cached)
      this.memCache.set(id, { data: user, expiry: Date.now() + 30_000 })
      return user
    }

    // L3: Database
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundError('User not found')

    // Populate caches
    await redis.setex(`user:${id}`, 300, JSON.stringify(user))
    this.memCache.set(id, { data: user, expiry: Date.now() + 30_000 })
    return user
  }
}
```

---

## 4. Error Handling Architecture

### Application Error Hierarchy

```typescript
// Base error with code, status, and context
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      `${resource}${id ? ` (${id})` : ''} not found`,
      `${resource.toUpperCase()}_NOT_FOUND`,
      404
    )
  }
}

class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('Validation failed', 'VALIDATION_ERROR', 400, { details })
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

// Centralized error handler (Express middleware)
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.context }
    })
  }
  // Unknown errors — log full details, return generic message
  logger.error('Unhandled error', { error: err, path: req.path })
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  })
}
```

---

## 5. Authentication & Authorization

### JWT vs Session Decision

```
JWT (Stateless):
  ✅ Microservices (no shared session store)
  ✅ Mobile/SPA clients
  ✅ Short-lived access + refresh token pattern
  ❌ Cannot revoke instantly (use short TTL + blacklist)

Session (Stateful):
  ✅ Server-rendered apps
  ✅ Need instant revocation
  ✅ Simpler implementation
  ❌ Requires shared session store for scaling
```

### RBAC Pattern

```typescript
// Permission-based, not role-based checks in code
type Permission = 'user:read' | 'user:write' | 'user:delete' | 'admin:*'

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  viewer:  ['user:read'],
  editor:  ['user:read', 'user:write'],
  admin:   ['admin:*'],
}

function requirePermission(...perms: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPerms = ROLE_PERMISSIONS[req.user.role] ?? []
    const hasAll = perms.every(p =>
      userPerms.includes(p) || userPerms.includes('admin:*')
    )
    if (!hasAll) return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
    })
    next()
  }
}

// Usage: router.delete('/users/:id', requirePermission('user:delete'), handler)
```

---

## 6. Background Jobs & Event-Driven Patterns

### When to Use Async Processing

```
Synchronous (in request):
  - User needs immediate feedback
  - Operation < 200ms
  - Critical path (payment capture)

Asynchronous (background job):
  - Email/notification sending
  - Report generation
  - Image/video processing
  - Data aggregation
  - Third-party API calls (non-blocking)
```

```typescript
// Event-driven decoupling pattern
interface DomainEvent {
  type: string
  payload: unknown
  timestamp: Date
  correlationId: string
}

class EventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>()

  on(type: string, handler: (event: DomainEvent) => Promise<void>) {
    const existing = this.handlers.get(type) ?? []
    this.handlers.set(type, [...existing, handler])
  }

  async publish(type: string, payload: unknown) {
    const event: DomainEvent = {
      type,
      payload,
      timestamp: new Date(),
      correlationId: crypto.randomUUID(),
    }
    const handlers = this.handlers.get(type) ?? []
    await Promise.allSettled(handlers.map(h => h(event)))
  }
}

// Registration: separate concerns via events
eventBus.on('user.created', async (e) => emailService.sendWelcome(e.payload))
eventBus.on('user.created', async (e) => analyticsService.track(e))
eventBus.on('order.completed', async (e) => inventoryService.reduce(e.payload))
```
