#!/usr/bin/env node

/**
 * Import Firebase JSON export into Convex.
 *
 * Usage:
 *   node utils/migrate/firebase.js <userId>          # import to dev
 *   node utils/migrate/firebase.js <userId> --prod   # import to prod
 *
 * Reads utils/migrate/data.json.
 * Deletes existing user data before importing.
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const args = process.argv.slice(2)
const isProd = args.includes('--prod')
const USER_ID = args.find(a => !a.startsWith('--'))

if (!USER_ID) {
  console.error('Usage: node utils/migrate/firebase.js <userId> [--prod]')
  process.exit(1)
}

const BATCH_SIZE = 200
const ENV = isProd ? 'PROD' : 'DEV'
const JSON_FILE = './utils/migrate/data.json'

console.log(`\n=== Import to ${ENV} (userId: ${USER_ID}) ===\n`)

const data = JSON.parse(readFileSync(JSON_FILE, 'utf8'))
console.log(`Accounts: ${Object.keys(data.accounts).length}`)
console.log(`Categories: ${Object.keys(data.categories).length}`)
console.log(`Trns: ${Object.keys(data.trns).length}`)

const TMP = join(tmpdir(), 'finapp-import')
execSync(`mkdir -p ${TMP}`)

function runConvex(fnPath, fnArgs) {
  const flag = isProd ? ' --prod' : ''
  const argsFile = join(TMP, 'args.json')
  const outFile = join(TMP, 'out.json')
  writeFileSync(argsFile, JSON.stringify(fnArgs))
  const argsStr = readFileSync(argsFile, 'utf-8')
  const cmd = `npx convex run ${fnPath} '${argsStr}'${flag} > ${outFile} 2>&1`
  console.log(`  convex run ${fnPath}${flag}`)

  try {
    execSync(cmd, { maxBuffer: 100 * 1024 * 1024, shell: true })
  }
  catch (e) {
    const out = readFileSync(outFile, 'utf-8')
    console.error('Error output:', out)
    throw e
  }

  const stdout = readFileSync(outFile, 'utf-8').trim()

  try {
    return JSON.parse(stdout)
  }
  catch {}

  const jsonStart = stdout.indexOf('{')
  if (jsonStart !== -1) {
    try {
      return JSON.parse(stdout.slice(jsonStart))
    }
    catch {}
  }

  const lines = stdout.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(lines[i])
    }
    catch {}
  }

  console.log('stdout:', stdout)
  return null
}

function fixIcon(icon) {
  if (!icon || icon.trim() === '')
    return 'mdi:category-outline'
  const match = icon.match(/mdi[- ]mdi-(.+)/)
  if (match)
    return `mdi:${match[1]}`
  return icon
}

// 0. Delete existing data
console.log(`\n=== Deleting existing data on ${ENV} ===`)
const deleted = runConvex('migrate:deleteUserData', { userId: USER_ID })
console.log('Deleted:', deleted)

// 1. Import wallets
console.log(`\n=== Importing ${Object.keys(data.accounts).length} wallets ===`)
const wallets = Object.entries(data.accounts).map(([oldId, w]) => ({
  color: w.color,
  currency: w.currency,
  desc: w.desc || undefined,
  isArchived: w.isArchived ?? false,
  isExcludeInTotal: w.isExcludeInTotal ?? false,
  isWithdrawal: w.isWithdrawal ?? false,
  name: w.name,
  oldId,
  order: w.order ?? 0,
  type: w.type,
  updatedAt: w.editedAt ?? Date.now(),
  ...(w.creditLimit !== undefined ? { creditLimit: w.creditLimit } : {}),
}))

const walletIdMap = runConvex('migrate:insertWallets', { userId: USER_ID, wallets })
console.log(`Wallet ID map: ${Object.keys(walletIdMap).length} entries`)

// 2. Import categories
console.log(`\n=== Importing ${Object.keys(data.categories).length} categories ===`)

const childIdsMap = {}
for (const [id, cat] of Object.entries(data.categories)) {
  if (cat.parentId && cat.parentId !== 0) {
    if (!childIdsMap[cat.parentId])
      childIdsMap[cat.parentId] = []
    childIdsMap[cat.parentId].push(id)
  }
}

const categories = Object.entries(data.categories).map(([oldId, c]) => ({
  color: c.color,
  icon: fixIcon(c.icon),
  name: c.name,
  oldChildIds: childIdsMap[oldId] || [],
  oldId,
  oldParentId: c.parentId === 0 ? undefined : c.parentId ? String(c.parentId) : undefined,
  parentId: 0,
  showInLastUsed: c.showInLastUsed ?? false,
  showInQuickSelector: c.showInQuickSelector ?? false,
  updatedAt: c.edited,
}))

const categoryIdMap = runConvex('migrate:insertCategories', { categories, userId: USER_ID })
console.log(`Category ID map: ${Object.keys(categoryIdMap).length} entries`)

// 3. Import trns
const allTrns = Object.entries(data.trns).map(([_oldId, t]) => {
  const trn = {
    date: t.date,
    type: t.type,
    updatedAt: t.edited,
  }

  if (t.desc)
    trn.desc = t.desc
  if (t.amount !== undefined)
    trn.amount = t.amount

  // Map wallet IDs (handle old walletFromId/walletToId format)
  const expenseWalletId = t.expenseWalletId || t.walletFromId
  const incomeWalletId = t.incomeWalletId || t.walletToId

  if (expenseWalletId)
    trn.expenseWalletId = walletIdMap[expenseWalletId] || expenseWalletId
  if (incomeWalletId)
    trn.incomeWalletId = walletIdMap[incomeWalletId] || incomeWalletId
  if (t.walletId && !expenseWalletId && !incomeWalletId)
    trn.walletId = walletIdMap[t.walletId] || t.walletId
  else if (t.walletId && t.type !== 2)
    trn.walletId = walletIdMap[t.walletId] || t.walletId

  if (t.categoryId === 'transfer' && t.type === 2)
    trn.categoryId = 'transfer'
  else if (t.categoryId === 'transfer' || t.categoryId === 'adjustment')
    trn.categoryId = 'adjustment'
  else if (t.categoryId)
    trn.categoryId = categoryIdMap[t.categoryId] || t.categoryId

  // Map amounts (handle old amountFrom/amountTo format)
  if (t.expenseAmount !== undefined)
    trn.expenseAmount = t.expenseAmount
  else if (t.amountFrom !== undefined)
    trn.expenseAmount = t.amountFrom
  if (t.incomeAmount !== undefined)
    trn.incomeAmount = t.incomeAmount
  else if (t.amountTo !== undefined)
    trn.incomeAmount = t.amountTo

  return trn
})

let missingWallets = 0
let missingCategories = 0
for (const t of allTrns) {
  if (t.walletId && !t.walletId.startsWith('j') && !t.walletId.startsWith('k'))
    missingWallets++
  if (t.categoryId && t.categoryId !== 'transfer' && t.categoryId !== 'adjustment' && !t.categoryId.startsWith('j') && !t.categoryId.startsWith('k'))
    missingCategories++
}
if (missingWallets)
  console.warn(`Warning: ${missingWallets} trns with unmapped walletId`)
if (missingCategories)
  console.warn(`Warning: ${missingCategories} trns with unmapped categoryId`)

console.log(`\n=== Importing ${allTrns.length} trns in batches of ${BATCH_SIZE} ===`)
let totalImported = 0
for (let i = 0; i < allTrns.length; i += BATCH_SIZE) {
  const batch = allTrns.slice(i, i + BATCH_SIZE)
  const count = runConvex('migrate:insertTrnsBatch', { trns: batch, userId: USER_ID })
  totalImported += count
  console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${totalImported}/${allTrns.length}`)
}

// 4. Import user settings
if (data.settings) {
  console.log('\n=== Importing user settings ===')
  runConvex('migrate:insertUserSettings', {
    baseCurrency: data.settings.baseCurrency,
    locale: data.settings.lang,
    userId: USER_ID,
  })
}

console.log(`\n=== Import to ${ENV} complete! ===`)
console.log(`  Wallets: ${wallets.length}`)
console.log(`  Categories: ${categories.length}`)
console.log(`  Trns: ${totalImported}`)
