---
paths:
  - "**/*.ts"
  - "**/*.vue"
  - "**/*.js"
  - "convex/**"
---
# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All Convex mutations/queries check `getAuthUserId(ctx)`
- [ ] All Convex args use validators (`v.string()`, `v.id()`, etc.)
- [ ] Data queries filter by `userId` (no cross-user data leaks)
- [ ] No unsanitized `v-html` with user content
- [ ] Error messages don't leak sensitive data
- [ ] `trustedOrigins` in `http.ts` is restrictive (no wildcards)

## Secret Management

- NEVER hardcode secrets in source code
- Frontend env vars: `VITE_*` prefix (public by design)
- Backend env vars: set via `npx convex env set`
- Validate required secrets exist at startup
- Rotate any secrets that may have been exposed

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Use **security-reviewer** agent for full audit
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review codebase for similar issues
