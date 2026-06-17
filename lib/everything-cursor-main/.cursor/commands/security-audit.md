# /security-audit — Security Vulnerability Scan

Perform a security audit against OWASP Top 10 categories.

## When to Use

- Before deploying to production
- After adding authentication, authorization, or data handling code
- When handling user input, file uploads, or external data
- Periodic security review

## Input

```
/security-audit [file path, directory, or scope description]
```

## What Happens

1. **Traces trust boundaries** — Where untrusted data enters
2. **Checks OWASP Top 10** — Injection, XSS, CSRF, broken auth, etc.
3. **Scans for secrets** — Hardcoded keys, tokens, credentials
4. **Classifies severity** — CRITICAL / HIGH / MEDIUM / LOW
5. **Provides remediation** — Specific code fixes for each finding

## Example

```
/security-audit src/api/
```

Delegates to: `@agents/security-reviewer` for threat analysis with severity ratings
