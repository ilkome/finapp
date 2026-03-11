import { describe, expect, it } from 'vitest'

import type { OfflineOp } from '~/components/offline/types'
import type { Transaction, Transfer, TrnItem } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

import { extractRemaps, groupOpsByEntity, isTrnOrphaned, remapTrnIds, splitCategoryOps } from './replayHelpers'

function makeOp(entity: OfflineOp['entity'], id: string, type: OfflineOp['type'] = 'create', data?: Record<string, unknown>): OfflineOp {
  return { data, entity, id, timestamp: Date.now(), type }
}

// --- remapTrnIds ---

describe('remapTrnIds', () => {
  const remap = new Map([['local_w1', 'convex_w1'], ['local_c1', 'convex_c1']])

  it('remaps walletId and categoryId for transaction', () => {
    const trn = {
      amount: 100,
      categoryId: 'local_c1',
      date: 1000,
      type: TrnType.Expense,
      updatedAt: 1000,
      walletId: 'local_w1',
    } as TrnItem

    const result = remapTrnIds(trn, remap) as Transaction
    expect(result.walletId).toBe('convex_w1')
    expect(result.categoryId).toBe('convex_c1')
  })

  it('remaps expenseWalletId and incomeWalletId for transfer', () => {
    const remap2 = new Map([['local_w1', 'convex_w1'], ['local_w2', 'convex_w2']])
    const trn = {
      categoryId: 'transfer',
      date: 1000,
      expenseAmount: 100,
      expenseWalletId: 'local_w1',
      incomeAmount: 100,
      incomeWalletId: 'local_w2',
      type: TrnType.Transfer,
      updatedAt: 1000,
    } as TrnItem

    const result = remapTrnIds(trn, remap2) as Transfer
    expect(result.expenseWalletId).toBe('convex_w1')
    expect(result.incomeWalletId).toBe('convex_w2')
  })

  it('keeps original IDs when no remap exists', () => {
    const trn = {
      amount: 50,
      categoryId: 'food',
      date: 1000,
      type: TrnType.Income,
      updatedAt: 1000,
      walletId: 'real_w1',
    } as TrnItem

    const result = remapTrnIds(trn, remap) as Transaction
    expect(result.walletId).toBe('real_w1')
    expect(result.categoryId).toBe('food')
  })

  it('does not mutate original', () => {
    const trn = {
      amount: 100,
      categoryId: 'local_c1',
      date: 1000,
      type: TrnType.Expense,
      updatedAt: 1000,
      walletId: 'local_w1',
    } as Transaction

    remapTrnIds(trn, remap)
    expect(trn.walletId).toBe('local_w1')
  })
})

// --- isTrnOrphaned ---

describe('isTrnOrphaned', () => {
  const wallets = { w1: {}, w2: {} }
  const categories = { food: {}, transport: {} }

  it('returns false for valid transaction', () => {
    const trn = { categoryId: 'food', type: TrnType.Expense, walletId: 'w1' } as TrnItem
    expect(isTrnOrphaned(trn, wallets, categories)).toBe(false)
  })

  it('returns true for missing wallet', () => {
    const trn = { categoryId: 'food', type: TrnType.Expense, walletId: 'missing' } as TrnItem
    expect(isTrnOrphaned(trn, wallets, categories)).toBe(true)
  })

  it('returns true for missing category', () => {
    const trn = { categoryId: 'missing', type: TrnType.Expense, walletId: 'w1' } as TrnItem
    expect(isTrnOrphaned(trn, wallets, categories)).toBe(true)
  })

  it('returns false for valid transfer', () => {
    const trn = {
      expenseWalletId: 'w1',
      incomeWalletId: 'w2',
      type: TrnType.Transfer,
    } as TrnItem
    expect(isTrnOrphaned(trn, wallets, categories)).toBe(false)
  })

  it('returns true for transfer with missing wallet', () => {
    const trn = {
      expenseWalletId: 'w1',
      incomeWalletId: 'missing',
      type: TrnType.Transfer,
    } as TrnItem
    expect(isTrnOrphaned(trn, wallets, categories)).toBe(true)
  })
})

// --- groupOpsByEntity ---

describe('groupOpsByEntity', () => {
  it('groups operations by entity type', () => {
    const ops = [
      makeOp('wallets', 'w1'),
      makeOp('trns', 't1'),
      makeOp('categories', 'c1'),
      makeOp('wallets', 'w2'),
      makeOp('userSettings', 's1'),
      makeOp('trns', 't2'),
    ]

    const result = groupOpsByEntity(ops)
    expect(result.walletOps).toHaveLength(2)
    expect(result.categoryOps).toHaveLength(1)
    expect(result.trnOps).toHaveLength(2)
    expect(result.settingsOps).toHaveLength(1)
  })

  it('returns empty arrays for empty input', () => {
    const result = groupOpsByEntity([])
    expect(result.walletOps).toEqual([])
    expect(result.categoryOps).toEqual([])
    expect(result.trnOps).toEqual([])
    expect(result.settingsOps).toEqual([])
  })

  it('preserves op references', () => {
    const op = makeOp('trns', 't1')
    const result = groupOpsByEntity([op])
    expect(result.trnOps[0]).toBe(op)
  })
})

// --- splitCategoryOps ---

describe('splitCategoryOps', () => {
  it('splits parent and child categories', () => {
    const ops = [
      makeOp('categories', 'c1', 'create', { name: 'Food', parentId: 0 }),
      makeOp('categories', 'c2', 'create', { name: 'Groceries', parentId: 'c1' }),
      makeOp('categories', 'c3', 'create', { name: 'Transport', parentId: 0 }),
    ]

    const result = splitCategoryOps(ops)
    expect(result.parentOps).toHaveLength(2)
    expect(result.childOps).toHaveLength(1)
    expect(result.childOps[0]!.id).toBe('c2')
  })

  it('puts delete ops in parentOps', () => {
    const ops = [
      makeOp('categories', 'c1', 'delete'),
      makeOp('categories', 'c2', 'create', { name: 'Child', parentId: 'c1' }),
    ]

    const result = splitCategoryOps(ops)
    expect(result.parentOps).toHaveLength(1)
    expect(result.parentOps[0]!.type).toBe('delete')
    expect(result.childOps).toHaveLength(1)
  })

  it('treats no parentId as root', () => {
    const ops = [
      makeOp('categories', 'c1', 'create', { name: 'Root' }),
    ]

    const result = splitCategoryOps(ops)
    expect(result.parentOps).toHaveLength(1)
    expect(result.childOps).toHaveLength(0)
  })

  it('returns empty arrays for empty input', () => {
    const result = splitCategoryOps([])
    expect(result.parentOps).toEqual([])
    expect(result.childOps).toEqual([])
  })
})

// --- extractRemaps ---

describe('extractRemaps', () => {
  it('extracts localId/convexId pairs', () => {
    const results = [
      { convexId: 'convex_1', localId: 'local_1' },
      { convexId: 'convex_2', localId: 'local_2' },
    ]
    const remaps = extractRemaps(results)
    expect(remaps).toHaveLength(2)
    expect(remaps[0]).toEqual({ convexId: 'convex_1', localId: 'local_1' })
  })

  it('skips non-remap results', () => {
    const results = [
      undefined,
      null,
      'string',
      42,
      { other: 'data' },
      { convexId: 'c1', localId: 'l1' },
    ]
    const remaps = extractRemaps(results)
    expect(remaps).toHaveLength(1)
  })

  it('returns empty for empty results', () => {
    expect(extractRemaps([])).toEqual([])
  })
})
