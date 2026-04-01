---
name: security-review
description: Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing sensitive features. Provides comprehensive security checklist and patterns adapted for Nuxt 4 + Convex + Better Auth stack.
---

# Security Review Skill

Ensures all code follows security best practices. Adapted for Finapp stack: Nuxt 4 (SPA), Vue 3, Convex backend, Better Auth, TypeScript.

## When to Activate

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating Convex mutations/queries/actions
- Working with secrets or credentials
- Storing or transmitting sensitive data
- Integrating third-party APIs
- Modifying auth flow (Better Auth, Convex auth, cross-domain cookies)

## Security Checklist

### 1. Secrets Management

#### NEVER Do This
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

#### ALWAYS Do This
```typescript
// Nuxt runtime config (client-safe)
const config = useRuntimeConfig()
const publicKey = config.public.convexUrl

// Convex backend env vars
const apiKey = process.env.OPEN_EXCHANGE_RATES_KEY
if (!apiKey) {
  throw new Error('OPEN_EXCHANGE_RATES_KEY not configured')
}
```

#### Verification Steps
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] Frontend secrets only in `VITE_*` env vars (public by design)
- [ ] Backend secrets set via `npx convex env set` (never in code)
- [ ] `.env.local` in .gitignore
- [ ] No secrets in git history
- [ ] `BETTER_AUTH_SECRET` set on both dev and prod Convex deployments

### 2. Input Validation

#### Always Validate User Input
```typescript
import { z } from 'zod'

const CreateTrnSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  walletId: z.string().min(1),
  type: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  date: z.number().int().positive(),
  description: z.string().max(500).optional(),
})

// Validate before processing
const validated = CreateTrnSchema.parse(input)
```

#### Convex Validators
```typescript
// convex/validators.ts - always use argument validators
import { v } from 'convex/values'

export const createTrn = mutation({
  args: {
    amount: v.number(),
    categoryId: v.id('categories'),
    walletId: v.id('wallets'),
    type: v.union(v.literal(0), v.literal(1), v.literal(2)),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Unauthorized')
    // ...
  },
})
```

#### Verification Steps
- [ ] All Convex mutations/queries have `args` validators
- [ ] All user inputs validated with Zod schemas on frontend
- [ ] Convex `v.id()` used for document references (not raw strings)
- [ ] Error messages don't leak sensitive info

### 3. Authentication & Authorization

#### Convex Auth Checks
```typescript
// WRONG: No auth check
export const getMyData = query({
  handler: async (ctx) => {
    return await ctx.db.query('trns').collect() // Returns ALL users' data!
  },
})

// CORRECT: Always verify user
export const getMyData = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    return await ctx.db
      .query('trns')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect()
  },
})
```

#### Better Auth Cookie Security
```typescript
// Cross-domain cookie must be Secure + SameSite
// Verify in composables/useAuthCookie.ts:
// - HttpOnly where possible
// - Secure in production
// - SameSite=None for cross-domain (Convex)
// - Short-lived tokens with refresh
```

#### Verification Steps
- [ ] Every Convex mutation/query checks `getAuthUserId(ctx)`
- [ ] Data queries filter by `userId` (no cross-user data leaks)
- [ ] Auth cookie (`finapp.localAuthUid`) is not used as security token
- [ ] `fetchToken` in `plugins/convex.ts` handles token expiry
- [ ] `trustedOrigins` in Convex `http.ts` is restrictive

### 4. XSS Prevention

#### Vue Template Safety
```vue
<!-- SAFE: Vue auto-escapes interpolation -->
<p>{{ userInput }}</p>

<!-- DANGEROUS: v-html renders raw HTML -->
<div v-html="userInput" />

<!-- If v-html is required, sanitize first -->
<script setup>
import DOMPurify from 'dompurify'
const safeHtml = computed(() => DOMPurify.sanitize(rawHtml))
</script>
<div v-html="safeHtml" />
```

#### Verification Steps
- [ ] No `v-html` with unsanitized user content
- [ ] No dynamic `href` with `javascript:` protocol
- [ ] CSP headers configured in production
- [ ] User-provided URLs validated before rendering

### 5. CSRF Protection

#### Convex CSRF
Convex mutations are called via WebSocket (not HTTP POST), so traditional CSRF doesn't apply. However:

```typescript
// HTTP endpoints in convex/http.ts MUST validate origin
const http = httpRouter()

// CORS must be restrictive
// trustedOrigins should only include your domains
```

#### Verification Steps
- [ ] `cors: true` in Convex `http.ts` uses proper `trustedOrigins`
- [ ] No wildcard `*` in CORS origins
- [ ] Webhook endpoints validate secrets (e.g., Telegram `TELEGRAM_WEBHOOK_SECRET`)

### 6. Sensitive Data Exposure

#### Logging
```typescript
// WRONG: Logging sensitive data
console.log('User login:', { email, password })
console.log('Token:', authToken)

// CORRECT: Redact sensitive data
console.log('User login:', { email, userId })
```

#### Convex Query Results
```typescript
// WRONG: Returning full user object
export const getUser = query({
  handler: async (ctx) => {
    return await ctx.db.get(userId) // May include sensitive fields
  },
})

// CORRECT: Pick only needed fields
export const getUser = query({
  handler: async (ctx) => {
    const user = await ctx.db.get(userId)
    if (!user) return null
    return { name: user.name, email: user.email }
  },
})
```

#### Verification Steps
- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] Convex queries return only necessary fields
- [ ] No `console.log` with sensitive data in production

### 7. Dependency Security

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically fixable issues
pnpm audit --fix

# Check for outdated packages
pnpm outdated
```

#### Verification Steps
- [ ] `pnpm audit` shows no high/critical vulnerabilities
- [ ] Lock file (`pnpm-lock.yaml`) committed
- [ ] Dependencies up to date

### 8. Offline Queue Security

The offline queue (`app/components/offline/helpers.ts`, `replay.ts`) stores pending operations in localStorage:

- [ ] Offline ops don't store sensitive data beyond IDs
- [ ] Replay validates operations before sending to Convex
- [ ] Frontend IDs (`local_*`) are never trusted server-side
- [ ] Convex mutations re-validate all data from offline ops

## Pre-Deployment Security Checklist

Before ANY production deployment:

- [ ] **Secrets**: No hardcoded secrets, all in env vars / Convex env
- [ ] **Input Validation**: All Convex args use validators, frontend uses Zod
- [ ] **Auth**: Every Convex function checks `getAuthUserId()`
- [ ] **Data isolation**: All queries filter by `userId`
- [ ] **XSS**: No unsanitized `v-html`
- [ ] **CORS**: `trustedOrigins` restrictive in `http.ts`
- [ ] **Webhooks**: Validate secrets (Telegram, etc.)
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Logging**: No sensitive data logged
- [ ] **Dependencies**: `pnpm audit` clean
- [ ] **Env files**: `.env.local` gitignored, `.env.example` up to date

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Convex Auth Docs](https://docs.convex.dev/auth)
- [Better Auth Docs](https://www.better-auth.com/)
- [Vue Security](https://vuejs.org/guide/best-practices/security)
