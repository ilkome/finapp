// Mints a local Supabase session for the seeded test user and prints the value to
// store in localStorage under `finapp.auth`. Lets an agent / Playwright enter real
// PowerSync mode without Google OAuth. LOCAL DEV ONLY.
//
// Usage:
//   node app/scripts/dev-login.mjs                # prints { storageKey, value }
//   node app/scripts/dev-login.mjs --raw          # prints just the JSON session value
// In the browser then: localStorage.setItem('finapp.auth', <value>); and clear the
// `finapp.isDemo` cookie before reloading.

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

function env(key, fallback) {
  if (process.env[key])
    return process.env[key]
  try {
    const line = readFileSync(resolve(here, '../.env'), 'utf8').split('\n').find(l => l.startsWith(`${key}=`))
    if (line)
      return line.slice(key.length + 1).trim()
  }
  catch {}
  return fallback
}

const SUPABASE_URL = env('VITE_SUPABASE_URL', 'http://127.0.0.1:54321')
const ANON_KEY = env('VITE_SUPABASE_ANON_KEY')
const EMAIL = env('E2E_EMAIL', 'e2e@finapp.local')
const PASSWORD = env('E2E_PASSWORD', 'finapp-e2e')
const STORAGE_KEY = 'finapp.auth'

const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
  method: 'POST',
})
const grant = await res.json()
if (!grant.access_token) {
  console.error('login failed:', grant)
  process.exit(1)
}

// supabase-js v2 persists the Session object directly under the storage key.
const session = {
  ...grant,
  expires_at: grant.expires_at ?? Math.floor(Date.now() / 1000) + grant.expires_in,
}

const value = JSON.stringify(session)
if (process.argv.includes('--raw'))
  process.stdout.write(value)
else
  process.stdout.write(JSON.stringify({ storageKey: STORAGE_KEY, userId: grant.user?.id, value }, null, 2))
