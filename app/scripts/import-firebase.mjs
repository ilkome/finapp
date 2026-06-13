#!/usr/bin/env node
// Import a Firebase JSON export into the Supabase + PowerSync backend.
//
// Successor to the old `utils/migrate/firebase.js` (Firebase -> Convex). The
// Supabase model lets the client pick row ids (all id columns are plain `text`,
// no FK constraints), so unlike the Convex version this reuses the Firebase ids
// verbatim - no id remap pass, references (parentId / walletId / categoryId)
// stay valid as-is.
//
// Writes go through PostgREST with the project's `service_role` key (bypasses
// RLS, runs over HTTPS so the IPv6-only direct Postgres connection is irrelevant)
// and upsert on the primary key, so re-running is idempotent.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role> \
//   node scripts/import-firebase.mjs <backup.json> --email <owner-email> [--wipe] [--dry-run]
//
//   # owner can also be given directly: --user-id <auth-uid>
//   # with neither flag, the email is read from the backup's `user.email`
//   # no SUPABASE_URL/KEY env -> falls back to the local stack via `supabase status`
//
// The owner must already exist as a Supabase auth user (sign in once first, e.g.
// via Google) so the imported rows' `userId` matches the uid you log in as.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const BATCH_SIZE = 500
// Firebase categories whose name marks them as the transfer/adjustment bucket are
// not real categories in this model - skip them and route their trns accordingly.
const ADJUSTMENT_CATEGORY_NAMES = new Set(['transfer', 'adjustment', 'перевод', 'корректировка'])

const args = process.argv.slice(2)
const positional = args.filter(a => !a.startsWith('--'))
const hasFlag = name => args.includes(name)
function getOpt(name) {
  const i = args.indexOf(name)
  return i !== -1 ? args[i + 1] : undefined
}

const BACKUP = positional[0]
const DRY_RUN = hasFlag('--dry-run')
const DO_WIPE = hasFlag('--wipe')

if (!BACKUP) {
  console.error('Usage: node scripts/import-firebase.mjs <backup.json> [--email <e> | --user-id <uid>] [--wipe] [--dry-run]')
  process.exit(1)
}

// --- config: explicit env wins; otherwise fall back to the local stack ---
function resolveConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key)
    return { apiUrl: url.replace(/\/$/, ''), serviceRoleKey: key }

  const raw = execFileSync('supabase', ['status', '-o', 'json'], { encoding: 'utf8' })
  const s = JSON.parse(raw)
  if (!s.API_URL || !s.SERVICE_ROLE_KEY)
    throw new Error('Provide SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, or start the local stack.')
  return { apiUrl: s.API_URL, serviceRoleKey: s.SERVICE_ROLE_KEY }
}

function headers(key) {
  return { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
}

async function resolveUid(apiUrl, key, email) {
  const res = await fetch(`${apiUrl}/auth/v1/admin/users?per_page=500`, { headers: headers(key) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error(`admin/users failed (${res.status}): ${JSON.stringify(body)}`)
  const found = (body.users ?? []).find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (!found)
    throw new Error(`No Supabase auth user for "${email}". Sign in once (e.g. Google) before importing.`)
  return found.id
}

async function deleteForUser(apiUrl, key, table, uid) {
  const res = await fetch(`${apiUrl}/rest/v1/${table}?userId=eq.${encodeURIComponent(uid)}`, {
    headers: { ...headers(key), Prefer: 'return=minimal' },
    method: 'DELETE',
  })
  if (!res.ok)
    throw new Error(`wipe ${table} failed (${res.status}): ${await res.text().catch(() => '')}`)
}

async function upsert(apiUrl, key, table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const res = await fetch(`${apiUrl}/rest/v1/${table}`, {
      body: JSON.stringify(batch),
      headers: { ...headers(key), Prefer: 'resolution=merge-duplicates,return=minimal' },
      method: 'POST',
    })
    if (!res.ok)
      throw new Error(`upsert ${table} failed (${res.status}) at row ${i}: ${await res.text().catch(() => '')}`)
  }
}

// "mdi mdi-golf-cart" -> "mdi:golf-cart"; empty -> a sane default.
function fixIcon(icon) {
  if (!icon || icon.trim() === '')
    return 'mdi:category-outline'
  const m = icon.match(/mdi[- ]mdi-(.+)/)
  return m ? `mdi:${m[1]}` : icon
}

// PostgREST bulk insert requires every object in a batch to share the same keys,
// so each builder emits a fixed key set with explicit nulls for absent fields.
function buildWallets(accounts, uid) {
  return Object.entries(accounts).map(([id, w]) => ({
    color: w.color,
    creditLimit: w.creditLimit ?? null,
    currency: w.currency,
    desc: (w.desc || w.description) || null,
    id,
    isArchived: w.isArchived ?? false,
    isExcludeInTotal: w.isExcludeInTotal ?? false,
    isWithdrawal: w.isWithdrawal ?? false,
    name: w.name,
    order: w.order ?? 0,
    type: w.type,
    updatedAt: w.editedAt ?? Date.now(),
    userId: uid,
  }))
}

function buildCategories(categories, uid, adjustmentIds) {
  return Object.entries(categories)
    .filter(([id]) => !adjustmentIds.has(id))
    .map(([id, c]) => {
      // 0 = root in Firebase; a parent that points at a skipped (adjustment) category becomes root too.
      let parentId = null
      if (c.parentId && c.parentId !== 0) {
        const p = String(c.parentId)
        parentId = adjustmentIds.has(p) ? null : p
      }
      return {
        color: c.color || '#607d8b',
        icon: fixIcon(c.icon),
        id,
        name: c.name,
        parentId,
        showInLastUsed: c.showInLastUsed ?? false,
        showInQuickSelector: c.showInQuickSelector ?? false,
        updatedAt: c.edited ?? c.editDate ?? Date.now(),
        userId: uid,
      }
    })
}

function buildTrns(trns, uid, adjustmentIds) {
  return Object.entries(trns).map(([id, t]) => {
    const cid = t.categoryId
    const isTransferCat = cid === 'transfer' || cid === 'adjustment' || adjustmentIds.has(cid)
    let categoryId = null
    if (isTransferCat && t.type === 2)
      categoryId = 'transfer'
    else if (isTransferCat)
      categoryId = 'adjustment' // an old "transfer"-tagged trn that is not a real type-2 transfer
    else if (cid)
      categoryId = cid

    const expenseWalletId = t.expenseWalletId || t.walletFromId
    const incomeWalletId = t.incomeWalletId || t.walletToId

    const row = {
      amount: null,
      categoryId,
      date: t.date,
      desc: (t.desc || t.description) || null,
      expenseAmount: null,
      expenseWalletId: null,
      id,
      incomeAmount: null,
      incomeWalletId: null,
      type: t.type,
      updatedAt: t.edited ?? t.date ?? Date.now(),
      userId: uid,
      walletId: null,
    }

    if (t.type === 2) {
      row.expenseAmount = t.expenseAmount ?? t.amountFrom ?? null
      row.incomeAmount = t.incomeAmount ?? t.amountTo ?? null
      row.expenseWalletId = expenseWalletId || null
      row.incomeWalletId = incomeWalletId || null
    }
    else {
      row.amount = t.amount ?? t.expenseAmount ?? t.amountFrom ?? null
      row.walletId = t.walletId || expenseWalletId || incomeWalletId || null
    }
    return row
  })
}

async function main() {
  const { apiUrl, serviceRoleKey } = resolveConfig()
  const data = JSON.parse(readFileSync(BACKUP, 'utf8'))

  const email = getOpt('--email') || data.user?.email
  const uid = getOpt('--user-id') || await resolveUid(apiUrl, serviceRoleKey, email)

  const adjustmentIds = new Set(
    Object.entries(data.categories ?? {})
      .filter(([, c]) => ADJUSTMENT_CATEGORY_NAMES.has((c.name || '').toLowerCase().trim()))
      .map(([id]) => id),
  )

  const wallets = buildWallets(data.accounts ?? {}, uid)
  const categories = buildCategories(data.categories ?? {}, uid, adjustmentIds)
  const trns = buildTrns(data.trns ?? {}, uid, adjustmentIds)
  const settings = [{
    baseCurrency: data.settings?.baseCurrency ?? 'USD',
    id: uid,
    locale: data.settings?.lang ?? null,
    userId: uid,
  }]

  const adjustments = trns.filter(t => t.categoryId === 'adjustment').length
  const transfers = trns.filter(t => t.categoryId === 'transfer').length
  console.log(`Target: ${apiUrl}  user ${uid} (${email})`)
  console.log(`Wallets: ${wallets.length}  Categories: ${categories.length} (skipped ${adjustmentIds.size} transfer/adjustment)`)
  console.log(`Trns: ${trns.length}  (transfers ${transfers}, adjustments ${adjustments})`)

  if (DRY_RUN) {
    console.log('\n--dry-run: nothing written. Samples:')
    console.log('wallet  ', JSON.stringify(wallets[0]))
    console.log('category', JSON.stringify(categories[0]))
    console.log('trn     ', JSON.stringify(trns.find(t => t.type === 2) ?? trns[0]))
    return
  }

  if (DO_WIPE) {
    console.log('\nWiping existing user rows (trns, categories, wallets)...')
    for (const table of ['trns', 'categories', 'wallets'])
      await deleteForUser(apiUrl, serviceRoleKey, table, uid)
  }

  console.log('\nImporting...')
  await upsert(apiUrl, serviceRoleKey, 'wallets', wallets)
  await upsert(apiUrl, serviceRoleKey, 'categories', categories)
  await upsert(apiUrl, serviceRoleKey, 'trns', trns)
  await upsert(apiUrl, serviceRoleKey, 'user_settings', settings)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
