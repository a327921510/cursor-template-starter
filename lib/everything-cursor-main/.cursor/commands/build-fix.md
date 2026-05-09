# /build-fix — Fix Build Errors

Diagnose and fix build errors, type errors, and dependency issues.

## When to Use

- Build or compilation fails
- TypeScript type errors you can't resolve
- Dependency conflicts or missing modules
- Configuration issues

## Input

```
/build-fix [paste the error message, or describe the problem]
```

## What Happens

1. **Reads** the full error message and categorizes it
2. **Identifies** the root cause (not just the symptom)
3. **Applies** the minimal fix
4. **Verifies** the build succeeds
5. **Documents** how to prevent recurrence

## Example

```
/build-fix
TS2339: Property 'user' does not exist on type 'Session'
```

Delegates to: `@agents/build-error-resolver` for systematic diagnosis
