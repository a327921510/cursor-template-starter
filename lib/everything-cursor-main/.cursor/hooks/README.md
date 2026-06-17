# Hooks — Automated Quality Gates

## Important Note

The `hooks.json` file defines **conceptual check definitions** — patterns and rules that should be enforced. To make these checks actually run automatically, you need to integrate them with real Git hooks tooling.

## Recommended Setup: husky + lint-staged

### 1. Install Dependencies

```bash
npm install -D husky lint-staged
```

### 2. Initialize Husky

```bash
npx husky init
```

### 3. Configure Pre-Commit Hook

Edit `.husky/pre-commit`:

```bash
npx lint-staged
```

### 4. Configure lint-staged in `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### 5. Add Type Check Script

Add to `package.json` scripts:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "check-all": "npm run type-check && npm run lint"
  }
}
```

## Check Definitions

| Check | What it detects | Severity | Why it matters |
|-------|----------------|----------|---------------|
| `no-console-log` | `console.log` in source files | Warning | Clutters production output, leaks data |
| `no-hardcoded-secrets` | API keys, passwords, tokens in code | Error | Security vulnerability |
| `no-ts-ignore` | `@ts-ignore` and `@ts-nocheck` | Error | Hides type errors that may be bugs |
| `no-any-type` | Explicit `any` type annotations | Warning | Defeats TypeScript's safety guarantees |

## Manual Pre-Commit Checks

If you prefer not to use husky, run these before committing:

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint . --max-warnings 0

# Format check
npx prettier --check .

# Check for secrets (basic grep)
npx secretlint "**/*"
```

## CI Integration

Add these checks to your CI pipeline (GitHub Actions example):

```yaml
- name: Type Check
  run: npx tsc --noEmit

- name: Lint
  run: npx eslint . --max-warnings 0

- name: Test
  run: npm test -- --coverage

- name: Security Audit
  run: npm audit --audit-level=high
```
