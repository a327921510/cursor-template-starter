# /tdd — Test-Driven Development

Execute the complete TDD workflow for a feature or function.

## When to Use

- Implementing a new function, service, or API endpoint
- You want tests to drive the design
- You need high confidence that the implementation is correct

## Input

Describe the feature or function to implement:

```
/tdd [feature description]
```

## What Happens

1. **Define** — Creates TypeScript interface/types for the feature
2. **RED** — Writes comprehensive failing tests (happy path + edge cases + errors)
3. **GREEN** — Implements minimal code to pass all tests
4. **REFACTOR** — Improves code quality while keeping tests green
5. **COVERAGE** — Verifies ≥80% coverage

## Example

```
/tdd Create a calculateDiscount function that applies percentage and fixed discounts with a max discount cap
```

Delegates to: `@agents/tdd-guide` for step-by-step cycle guidance
