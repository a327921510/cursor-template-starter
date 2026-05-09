# /doc-sync — Documentation Synchronization

Update documentation to match recent code changes.

## When to Use

- After changing a public API (function signature, parameters, return type)
- After adding a new feature or endpoint
- Before creating a release
- When documentation is out of date

## Input

```
/doc-sync [file or feature that changed]
```

## What Happens

1. **Detects** what changed (API signatures, behavior, config)
2. **Identifies** related documentation (JSDoc, README, CHANGELOG)
3. **Updates** all affected documentation
4. **Verifies** code examples still compile
5. **Adds** CHANGELOG entry if user-visible

## Example

```
/doc-sync src/api/users.ts
```

Delegates to: `@agents/doc-updater` for comprehensive documentation sync
