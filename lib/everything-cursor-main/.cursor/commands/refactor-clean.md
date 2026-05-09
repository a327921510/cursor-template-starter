# /refactor-clean — Dead Code Cleanup

Identify and safely remove unused code, imports, and dead paths.

## When to Use

- Routine codebase maintenance
- After a large feature removal or refactor
- When file sizes or bundle sizes are growing
- Before a major release

## Input

```
/refactor-clean [file path or directory]
```

## What Happens

1. **Scans** for unused imports, variables, functions, and exports
2. **Identifies** commented-out code and dead code paths
3. **Verifies** safety before each removal (no dynamic references)
4. **Removes** in small batches with test verification
5. **Reports** impact (files modified, lines removed)

## Example

```
/refactor-clean src/utils/
```

Delegates to: `@agents/refactor-cleaner` for safe, verified cleanup
