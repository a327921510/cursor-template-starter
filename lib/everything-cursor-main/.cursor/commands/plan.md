# /plan — Implementation Planning

Create a detailed, phased implementation plan for a feature.

## When to Use

- Starting a new feature or epic
- Task is complex with multiple steps and dependencies
- You need to estimate effort and identify risks before coding

## Input

```
/plan [feature or task description]
```

## What Happens

1. **Analyzes** requirements and identifies acceptance criteria
2. **Decomposes** into phased tasks (each ≤4 hours)
3. **Maps** dependencies between tasks
4. **Assesses** risks with mitigation strategies
5. **Produces** ordered implementation plan

## Example

```
/plan Add user authentication with email/password login, Google OAuth, and session management
```

Delegates to: `@agents/planner` for detailed task breakdown
