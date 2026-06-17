# /e2e — E2E Test Generation

Generate Playwright end-to-end tests for user journeys.

## When to Use

- Testing a complete user flow (login, checkout, onboarding)
- Verifying critical paths work across the full stack
- Adding regression tests for fixed bugs

## Input

```
/e2e [user journey description]
```

## What Happens

1. **Maps** the user journey into discrete steps
2. **Generates** Playwright tests with proper selectors (role/testid)
3. **Adds** assertions at each critical checkpoint
4. **Handles** setup/teardown for test isolation
5. **Avoids** flakiness patterns (no fixed timeouts)

## Example

```
/e2e User registers with email, receives welcome screen, and can view their profile
```

Delegates to: `@agents/e2e-runner` for reliable test generation
