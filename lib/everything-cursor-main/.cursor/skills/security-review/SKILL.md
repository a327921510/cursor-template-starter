# Security Review Skill

Comprehensive security audit methodology for web applications.

## When to Use

Activate this skill when:
- Reviewing code for security vulnerabilities
- Implementing authentication or authorization
- Handling user input or file uploads
- Working with sensitive data (PII, credentials, tokens)
- Preparing for a security audit or penetration test

---

## 1. OWASP Top 10 Quick Reference

```
A01: Broken Access Control
  → Check: Every endpoint validates permissions. No IDOR.
  → Test: Can user A access user B's data by changing the ID?

A02: Cryptographic Failures
  → Check: Passwords hashed with bcrypt/argon2. TLS everywhere.
  → Test: Are secrets in env vars? Is sensitive data encrypted at rest?

A03: Injection
  → Check: Parameterized queries. No string concatenation in SQL.
  → Test: Does ' OR 1=1-- in an input cause unexpected behavior?

A04: Insecure Design
  → Check: Rate limiting on auth endpoints. Account lockout.
  → Test: Can brute-force succeed? Is there business logic abuse?

A05: Security Misconfiguration
  → Check: No debug mode in production. Secure headers set.
  → Test: Are stack traces exposed? Default credentials removed?

A06: Vulnerable Components
  → Check: Dependencies up to date. No known CVEs.
  → Test: Run `npm audit`. Check Snyk/Dependabot alerts.

A07: Authentication Failures
  → Check: Strong password policy. MFA available. Session timeout.
  → Test: Can sessions be hijacked? Are tokens properly invalidated?

A08: Software/Data Integrity
  → Check: Signed packages. Integrity checks on CI/CD.
  → Test: Can deployment pipeline be tampered with?

A09: Logging & Monitoring Failures
  → Check: Auth events logged. Anomaly detection in place.
  → Test: Are failed login attempts logged? Alerts configured?

A10: SSRF
  → Check: Validate/whitelist URLs for server-side requests.
  → Test: Can internal endpoints be accessed via user-supplied URLs?
```

---

## 2. Input Validation Patterns

### Defense in Depth: Validate at Every Layer

```typescript
// Layer 1: Client-side (UX only — NEVER trust)
<input type="email" required maxLength={254} />

// Layer 2: API Handler (schema validation)
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[\p{L}\p{N}\s'-]+$/u, 'Invalid characters'),  // Unicode-safe
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .max(128, 'Maximum 128 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain upper, lower, and number'),
})

function createUserHandler(req: Request) {
  const input = CreateUserSchema.parse(req.body)  // throws if invalid
  // input is now typed AND validated
}

// Layer 3: Database (constraints as last defense)
// NOT NULL, UNIQUE, CHECK constraints, foreign keys
```

### File Upload Security

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB

async function validateUpload(file: File): Promise<Result<void>> {
  // 1. Check MIME type (don't trust Content-Type header alone)
  if (!ALLOWED_TYPES.includes(file.type as any)) {
    return { success: false, error: 'File type not allowed' }
  }

  // 2. Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large (max 5MB)' }
  }

  // 3. Verify magic bytes (actual file content check)
  const buffer = await file.arrayBuffer()
  const header = new Uint8Array(buffer.slice(0, 4))
  const isJPEG = header[0] === 0xFF && header[1] === 0xD8
  const isPNG = header[0] === 0x89 && header[1] === 0x50

  if (!isJPEG && !isPNG) {
    return { success: false, error: 'File content does not match declared type' }
  }

  // 4. Generate safe filename (never use user-provided filename)
  // const safeName = `${crypto.randomUUID()}.${getExtension(file.type)}`

  return { success: true, data: undefined }
}
```

---

## 3. Authentication Security

### Password Handling

```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12  // Increase over time as hardware improves

// Hashing — ONLY use bcrypt, argon2, or scrypt
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

// Verification — constant-time comparison (bcrypt does this internally)
async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

// ❌ NEVER: MD5, SHA1, SHA256 for passwords (too fast, no salt)
// ❌ NEVER: Roll your own crypto
// ❌ NEVER: Store plaintext passwords
// ❌ NEVER: Log passwords, even hashed ones
```

### JWT Security

```typescript
// Access token: short-lived (15 min), in memory
// Refresh token: long-lived (7 days), httpOnly cookie

function generateTokens(user: User) {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m', algorithm: 'HS256' }
  )

  const refreshToken = jwt.sign(
    { sub: user.id, tokenVersion: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d', algorithm: 'HS256' }
  )

  return { accessToken, refreshToken }
}

// Cookie settings for refresh token
const COOKIE_OPTIONS = {
  httpOnly: true,         // JavaScript cannot access
  secure: true,           // HTTPS only
  sameSite: 'strict',     // CSRF protection
  path: '/api/auth',      // Only sent to auth endpoints
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as const

// Token revocation: increment tokenVersion in DB
// On refresh, check if tokenVersion matches — if not, reject
```

### Rate Limiting

```typescript
// ❌ No rate limiting = brute force attacks
// ✅ Different limits for different endpoints

// Auth endpoints: strict (5 attempts / 15 min per IP)
// API endpoints: moderate (100 requests / min per user)
// Public pages: relaxed (300 requests / min per IP)

// Implementation with sliding window
class RateLimiter {
  async check(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Remove old entries, add current, check count
    await redis.zremrangebyscore(key, 0, windowStart)
    const count = await redis.zcard(key)
    
    if (count >= limit) return false
    
    await redis.zadd(key, now, `${now}-${crypto.randomUUID()}`)
    await redis.expire(key, Math.ceil(windowMs / 1000))
    return true
  }
}
```

---

## 4. Injection Prevention

### SQL Injection

```typescript
// ❌ CRITICAL VULNERABILITY: string interpolation in SQL
const query = `SELECT * FROM users WHERE email = '${email}'`
// Attack: email = "'; DROP TABLE users; --"

// ✅ Parameterized queries (driver level)
const result = await db.query('SELECT * FROM users WHERE email = $1', [email])

// ✅ ORM (Prisma — parameterized by default)
const user = await prisma.user.findUnique({ where: { email } })

// ✅ Query builder (Knex — parameterized by default)
const user = await knex('users').where({ email }).first()

// ⚠️ Even with ORM, raw queries need parameterization:
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`  // Prisma tagged template — safe
```

### XSS Prevention

```typescript
// ❌ Direct HTML insertion
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ React auto-escapes by default — just use JSX
<div>{userComment}</div>  // Safe: React escapes HTML entities

// ✅ If HTML is needed, sanitize with DOMPurify
import DOMPurify from 'dompurify'

const sanitized = DOMPurify.sanitize(userHTML, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
})
<div dangerouslySetInnerHTML={{ __html: sanitized }} />

// ✅ Content Security Policy header
// Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

---

## 5. Security Headers

```typescript
// Essential security headers — set on EVERY response
const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Force HTTPS
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  // Content Security Policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self'",
  // Prevent cross-origin information leakage
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
```

---

## 6. Security Review Checklist

```
Before EVERY deployment, verify:

Authentication:
  □ Passwords hashed with bcrypt (≥12 rounds) or argon2
  □ JWT access tokens ≤ 15 min, refresh tokens in httpOnly cookies
  □ Failed login attempts are rate-limited AND logged
  □ Session invalidation on password change

Authorization:
  □ Every endpoint checks permissions (not just authentication)
  □ No IDOR — users cannot access other users' data by changing IDs
  □ Admin endpoints are separated and protected
  □ API keys have minimal required scopes

Data Protection:
  □ No secrets in code, config files, or logs
  □ PII encrypted at rest
  □ TLS 1.2+ for all connections
  □ Sensitive fields excluded from API responses and logs

Input/Output:
  □ All user input validated with schema (Zod)
  □ SQL queries parameterized
  □ HTML output escaped (React default) or sanitized
  □ File uploads validated (type, size, content)

Infrastructure:
  □ Dependencies scanned (npm audit, Snyk)
  □ Error messages don't leak stack traces in production
  □ Security headers set on all responses
  □ CORS restricted to known origins
```
