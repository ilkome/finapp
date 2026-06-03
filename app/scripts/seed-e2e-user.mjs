#!/usr/bin/env node
// Seed a fixed, reproducible e2e test account into the local Supabase stack.
//
// Why: the `real` Playwright project (`*-real.spec.ts`) needs a real signed-in
// session in `tests/e2e/.auth/user.json` AND some baseline data to act on.
// Regenerating the session (via `pnpm test:e2e:auth`) requires an account to log
// into; the category-children specs additionally need existing categories to
// pick as children. This script provisions both deterministically so any machine
// gets the same e2e account.
//
// It reads the local `service_role` key + API URL from `supabase status -o json`
// at run time (never hardcoded). The user is created via the GoTrue admin API
// (raw-SQL seeding of `auth.users` is avoided - it depends on GoTrue's bcrypt
// internals). Categories are upserted via PostgREST with the service_role key
// (bypasses RLS), then sync down to the client through PowerSync.
//
// Idempotent: re-running treats an existing user as success and re-upserts the
// categories with fixed ids, resetting them to root (parentId null) so a prior
// test run that reparented them does not leave the account in a dirty state.
//
// Credentials are LOCAL-DEV ONLY (the stack runs on localhost). Override with
// E2E_USER_EMAIL / E2E_USER_PASSWORD if you prefer different ones.
//
// Usage: pnpm test:e2e:db:seed   (alias for `node scripts/seed-e2e-user.mjs`)
// Note: if pnpm's install gate blocks, run directly: `node scripts/seed-e2e-user.mjs`

import { execFileSync } from 'node:child_process'
import process from 'node:process'

const EMAIL = process.env.E2E_USER_EMAIL ?? 'e2e@finapp.local'
const PASSWORD = process.env.E2E_USER_PASSWORD ?? 'e2e-finapp-test-pw'

// Baseline root categories the `*-real.spec.ts` specs pick as child candidates.
// Fixed ids -> idempotent upsert; parentId null -> root (the client maps null<->0).
const CATEGORY_COUNT = 12

function readSupabaseStatus() {
  let raw
  try {
    raw = execFileSync('supabase', ['status', '-o', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  }
  catch (err) {
    throw new Error(
      `Failed to run \`supabase status -o json\`. Is the local stack up `
      + `(\`supabase start\`)?\n${err.stderr || err.message}`,
    )
  }

  let status
  try {
    status = JSON.parse(raw)
  }
  catch {
    throw new Error(`Could not parse \`supabase status -o json\` output:\n${raw}`)
  }

  const apiUrl = status.API_URL
  const serviceRoleKey = status.SERVICE_ROLE_KEY
  if (!apiUrl || !serviceRoleKey)
    throw new Error('supabase status is missing API_URL or SERVICE_ROLE_KEY - is the stack fully started?')

  return { apiUrl, serviceRoleKey }
}

function adminHeaders(serviceRoleKey) {
  return {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  }
}

// Create the user (or treat "already exists" as success) and return its uid.
async function ensureUser(apiUrl, serviceRoleKey) {
  const res = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    body: JSON.stringify({ email: EMAIL, email_confirm: true, password: PASSWORD }),
    headers: adminHeaders(serviceRoleKey),
    method: 'POST',
  })
  const body = await res.json().catch(() => ({}))

  if (res.ok) {
    console.log(`Seeded e2e user: ${EMAIL} (id ${body.id})`)
    return body.id
  }

  // Idempotency: GoTrue returns 422 when the user already exists.
  const code = body.error_code || body.code || ''
  const msg = body.msg || body.message || ''
  if (res.status === 422 && /already.*registered|already.*exists|email_exists/i.test(`${code} ${msg}`)) {
    console.log(`e2e user already exists: ${EMAIL} (ok)`)
    return resolveUid(apiUrl, serviceRoleKey)
  }

  throw new Error(`Admin create failed (${res.status}): ${JSON.stringify(body)}`)
}

// Look up the existing user's uid by email via the GoTrue admin list endpoint.
async function resolveUid(apiUrl, serviceRoleKey) {
  const res = await fetch(`${apiUrl}/auth/v1/admin/users?per_page=200`, {
    headers: adminHeaders(serviceRoleKey),
  })
  const body = await res.json().catch(() => ({}))
  const users = body.users ?? []
  const found = users.find(u => u.email === EMAIL)
  if (!found)
    throw new Error(`Could not resolve uid for ${EMAIL} from admin user list`)
  return found.id
}

// Upsert baseline root categories for the user (PostgREST, service_role bypasses RLS).
async function seedCategories(apiUrl, serviceRoleKey, uid) {
  const now = Date.now()
  const rows = Array.from({ length: CATEGORY_COUNT }, (_, i) => {
    const n = String(i + 1).padStart(2, '0')
    return {
      color: '#4caf50',
      icon: 'mdi:tag',
      id: `e2e-cat-${n}`,
      name: `E2E Category ${n}`,
      parentId: null,
      showInLastUsed: false,
      showInQuickSelector: false,
      updatedAt: now,
      userId: uid,
    }
  })

  const res = await fetch(`${apiUrl}/rest/v1/categories`, {
    body: JSON.stringify(rows),
    headers: {
      ...adminHeaders(serviceRoleKey),
      // Upsert on the primary key so re-runs reset state instead of erroring.
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    method: 'POST',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Category seed failed (${res.status}): ${text}`)
  }
  console.log(`Seeded ${CATEGORY_COUNT} baseline categories for ${EMAIL}`)
}

async function seed() {
  const { apiUrl, serviceRoleKey } = readSupabaseStatus()
  const uid = await ensureUser(apiUrl, serviceRoleKey)
  await seedCategories(apiUrl, serviceRoleKey, uid)
}

seed().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
