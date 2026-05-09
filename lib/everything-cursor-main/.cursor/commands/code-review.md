# /code-review — Code Quality Review

Perform a prioritized code review checking security, correctness, and maintainability.

## When to Use

- Before submitting a PR
- After completing a feature implementation
- When reviewing unfamiliar code

## Input

```
/code-review [file path, directory, or description of changes]
```

## What Happens

1. **Security scan** — Secrets, injection, auth issues
2. **Correctness check** — Logic bugs, edge cases, error handling
3. **Quality assessment** — Size limits, naming, immutability, types
4. **Performance review** — N+1 queries, memory leaks, bottlenecks
5. **Verdict** — Approve / Approve with comments / Request changes

## Example

```
/code-review src/services/order-service.ts
```

Delegates to: `@agents/code-reviewer` for structured review with severity ratings
