// Read-only backup of a finapp user's Supabase data via PostgREST (service-role). Resolves the
// user's uid by email, then dumps each table filtered to that user, to a timestamped JSON file
// OUTSIDE the repo (financial data must never be committed). Secrets come from env, never args.
//
// Usage:
//   SB_URL=https://<ref>.supabase.co \
//   SB_SERVICE_ROLE=<service_role_key> \
//   SB_EMAIL=user@example.com \
//   SB_LABEL=prod \
//   node scripts/backup-finapp.mjs

import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const url = process.env.SB_URL
const key = process.env.SB_SERVICE_ROLE
const email = process.env.SB_EMAIL
const label = process.env.SB_LABEL || 'backup'
const outDir = process.env.SB_OUTDIR || join(homedir(), 'finapp-backups')

if (!url || !key) {
  console.error('need SB_URL and SB_SERVICE_ROLE')
  process.exit(1)
}

const headers = { apikey: key, Authorization: `Bearer ${key}` }
const USER_TABLES = ['wallets', 'categories', 'trns', 'user_settings', 'budgets', 'budget_assignments', 'recurrences']
const GLOBAL_TABLES = ['rates'] // no userId column

let uid = null
if (email) {
  const r = await fetch(`${url}/auth/v1/admin/users?per_page=500`, { headers })
  if (!r.ok) {
    console.error('admin/users failed', r.status, await r.text())
    process.exit(1)
  }
  const j = await r.json()
  const users = j.users || j
  const u = users.find(x => (x.email || '').toLowerCase() === email.toLowerCase())
  if (!u) {
    console.error(`user not found: ${email}. known: ${users.map(x => x.email).join(', ')}`)
    process.exit(1)
  }
  uid = u.id
  console.log(`user ${email} -> ${uid}`)
}

const out = { meta: { at: new Date().toISOString(), email, label, uid, url }, tables: {} }

async function dump(table, filtered) {
  const filter = filtered && uid ? `&userId=eq.${uid}` : ''
  // PostgREST caps each response (default 1000), so page until a short page comes back.
  const pageSize = 1000
  const all = []
  for (let offset = 0; ; offset += pageSize) {
    const r = await fetch(`${url}/rest/v1/${table}?select=*${filter}&order=id&limit=${pageSize}&offset=${offset}`, { headers })
    if (!r.ok) {
      if (offset === 0) {
        console.error(`  ${table}: HTTP ${r.status} ${await r.text()}`)
        out.tables[table] = { error: r.status }
        return
      }
      break
    }
    const rows = await r.json()
    all.push(...rows)
    if (rows.length < pageSize)
      break
  }
  out.tables[table] = all
  console.log(`  ${table}: ${all.length}`)
}

for (const t of USER_TABLES) await dump(t, true)
for (const t of GLOBAL_TABLES) await dump(t, false)

mkdirSync(outDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const file = join(outDir, `finapp-${label}-${stamp}.json`)
writeFileSync(file, JSON.stringify(out, null, 2))
console.log(`saved: ${file}`)
