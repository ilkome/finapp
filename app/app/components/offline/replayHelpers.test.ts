import { describe, expect, it, vi } from 'vitest'

import type { OfflineOp } from '~/components/offline/types'
import type { Transaction, Transfer, TrnItem } from '~/components/trns/types'

import { OfflineEntityType } from '~/components/offline/types'
import { TrnType } from '~/components/trns/types'

import { collectRemaps, extractRemaps, groupOpsByEntity, isTrnOrphaned, remapTrnIds, replayCategoryOps, replaySettingsOps, replayTrnOps, replayWalletOps, splitCategoryOps } from './replayHelpers'

vi.mock('~/components/offline/helpers', () => ({
  removeOfflineOp: vi.fn(() => Promise.resolve()),
}))

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
      makeOp(OfflineEntityType.Wallets, 'w1'),
      makeOp(OfflineEntityType.Trns, 't1'),
      makeOp(OfflineEntityType.Categories, 'c1'),
      makeOp(OfflineEntityType.Wallets, 'w2'),
      makeOp(OfflineEntityType.UserSettings, 's1'),
      makeOp(OfflineEntityType.Trns, 't2'),
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
    expect(result.unknownOps).toEqual([])
  })

  it('preserves op references', () => {
    const op = makeOp(OfflineEntityType.Trns, 't1')
    const result = groupOpsByEntity([op])
    expect(result.trnOps[0]).toBe(op)
  })

  it('collects ops with unknown entity into unknownOps', () => {
    const known = makeOp(OfflineEntityType.Trns, 't1')
    const unknown = { entity: 'loanPaymentLinks', id: 'x1', timestamp: 0, type: 'update' } as unknown as OfflineOp
    const result = groupOpsByEntity([known, unknown])

    expect(result.trnOps).toHaveLength(1)
    expect(result.walletOps).toHaveLength(0)
    expect(result.categoryOps).toHaveLength(0)
    expect(result.settingsOps).toHaveLength(0)
    expect(result.unknownOps).toHaveLength(1)
    expect(result.unknownOps[0]).toBe(unknown)
  })
})

// --- splitCategoryOps ---

describe('splitCategoryOps', () => {
  it('splits parent and child categories', () => {
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c1', 'create', { name: 'Food', parentId: 0 }),
      makeOp(OfflineEntityType.Categories, 'c2', 'create', { name: 'Groceries', parentId: 'c1' }),
      makeOp(OfflineEntityType.Categories, 'c3', 'create', { name: 'Transport', parentId: 0 }),
    ]

    const result = splitCategoryOps(ops)
    expect(result.parentOps).toHaveLength(2)
    expect(result.childOps).toHaveLength(1)
    expect(result.childOps[0]!.id).toBe('c2')
  })

  it('puts delete ops in parentOps', () => {
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c1', 'delete'),
      makeOp(OfflineEntityType.Categories, 'c2', 'create', { name: 'Child', parentId: 'c1' }),
    ]

    const result = splitCategoryOps(ops)
    expect(result.parentOps).toHaveLength(1)
    expect(result.parentOps[0]!.type).toBe('delete')
    expect(result.childOps).toHaveLength(1)
  })

  it('treats no parentId as root', () => {
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c1', 'create', { name: 'Root' }),
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

// --- collectRemaps ---

describe('collectRemaps', () => {
  it('collects remap entries from resolved promises', async () => {
    const remapIds = new Map<string, string>()
    const promises = [
      Promise.resolve({ convexId: 'convex_1', localId: 'local_1' }),
      Promise.resolve({ convexId: 'convex_2', localId: 'local_2' }),
    ]

    await collectRemaps(promises, remapIds)
    expect(remapIds.get('local_1')).toBe('convex_1')
    expect(remapIds.get('local_2')).toBe('convex_2')
  })

  it('handles void and undefined promises', async () => {
    const remapIds = new Map<string, string>()
    const promises: (Promise<unknown> | void | undefined)[] = [
      undefined,
      Promise.resolve(undefined),
      Promise.resolve({ convexId: 'c1', localId: 'l1' }),
    ]

    await collectRemaps(promises, remapIds)
    expect(remapIds.size).toBe(1)
    expect(remapIds.get('l1')).toBe('c1')
  })

  it('appends to existing remap map', async () => {
    const remapIds = new Map([['existing_l', 'existing_c']])
    const promises = [
      Promise.resolve({ convexId: 'c1', localId: 'l1' }),
    ]

    await collectRemaps(promises, remapIds)
    expect(remapIds.size).toBe(2)
    expect(remapIds.get('existing_l')).toBe('existing_c')
    expect(remapIds.get('l1')).toBe('c1')
  })
})

// --- replayWalletOps ---

describe('replayWalletOps', () => {
  it('does nothing for empty ops', async () => {
    const saveWallet = vi.fn()
    const deleteWallet = vi.fn()
    const remapIds = new Map<string, string>()

    await replayWalletOps([], remapIds, { deleteWallet, saveWallet })
    expect(saveWallet).not.toHaveBeenCalled()
    expect(deleteWallet).not.toHaveBeenCalled()
  })

  it('calls saveWallet for create/update ops', async () => {
    const saveWallet = vi.fn(() => Promise.resolve())
    const deleteWallet = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Wallets, 'w1', 'create', { currency: 'USD', name: 'Cash', type: 'cash' }),
      makeOp(OfflineEntityType.Wallets, 'w2', 'update', { name: 'Bank', type: 'cashless' }),
    ]

    await replayWalletOps(ops, remapIds, { deleteWallet, saveWallet })
    expect(saveWallet).toHaveBeenCalledTimes(2)
    expect(saveWallet).toHaveBeenCalledWith({ id: 'w1', values: expect.objectContaining({ currency: 'USD', name: 'Cash', type: 'cash' }) })
    expect(saveWallet).toHaveBeenCalledWith({ id: 'w2', values: expect.objectContaining({ name: 'Bank', type: 'cashless' }) })
    expect(deleteWallet).not.toHaveBeenCalled()
  })

  it('calls deleteWallet for delete ops', async () => {
    const saveWallet = vi.fn()
    const deleteWallet = vi.fn(() => Promise.resolve())
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Wallets, 'w1', 'delete'),
    ]

    await replayWalletOps(ops, remapIds, { deleteWallet, saveWallet })
    expect(deleteWallet).toHaveBeenCalledWith('w1')
    expect(saveWallet).not.toHaveBeenCalled()
  })

  it('collects remaps from save results', async () => {
    const saveWallet = vi.fn(() => Promise.resolve({ convexId: 'convex_w1', localId: 'local_w1' }))
    const deleteWallet = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Wallets, 'local_w1', 'create', { name: 'Cash', type: 'cash' }),
    ]

    await replayWalletOps(ops, remapIds, { deleteWallet, saveWallet })
    expect(remapIds.get('local_w1')).toBe('convex_w1')
  })
})

// --- replayCategoryOps ---

describe('replayCategoryOps', () => {
  it('does nothing for empty ops', async () => {
    const saveCategory = vi.fn()
    const deleteCategory = vi.fn()
    const remapIds = new Map<string, string>()

    await replayCategoryOps([], remapIds, { deleteCategory, saveCategory })
    expect(saveCategory).not.toHaveBeenCalled()
    expect(deleteCategory).not.toHaveBeenCalled()
  })

  it('processes parent categories before children', async () => {
    const callOrder: string[] = []
    const saveCategory = vi.fn((params) => {
      callOrder.push(params.id)
      return Promise.resolve()
    })
    const deleteCategory = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c1', 'create', { name: 'Food', parentId: 0 }),
      makeOp(OfflineEntityType.Categories, 'c2', 'create', { name: 'Groceries', parentId: 'c1' }),
    ]

    await replayCategoryOps(ops, remapIds, { deleteCategory, saveCategory })
    expect(callOrder).toEqual(['c1', 'c2'])
  })

  it('remaps parentId for child categories', async () => {
    const saveCategory = vi.fn(() => Promise.resolve())
    const deleteCategory = vi.fn()
    const remapIds = new Map([['local_c1', 'convex_c1']])
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c2', 'create', { name: 'Groceries', parentId: 'local_c1' }),
    ]

    await replayCategoryOps(ops, remapIds, { deleteCategory, saveCategory })
    expect(saveCategory).toHaveBeenCalledWith(expect.objectContaining({
      values: expect.objectContaining({ parentId: 'convex_c1' }),
    }))
  })

  it('calls deleteCategory for delete ops', async () => {
    const saveCategory = vi.fn()
    const deleteCategory = vi.fn(() => Promise.resolve())
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c1', 'delete'),
    ]

    await replayCategoryOps(ops, remapIds, { deleteCategory, saveCategory })
    expect(deleteCategory).toHaveBeenCalledWith('c1')
  })

  it('always passes isUpdateChildCategoriesColor as false', async () => {
    const saveCategory = vi.fn(() => Promise.resolve())
    const deleteCategory = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Categories, 'c1', 'create', { name: 'Food', parentId: 0 }),
    ]

    await replayCategoryOps(ops, remapIds, { deleteCategory, saveCategory })
    expect(saveCategory).toHaveBeenCalledWith(expect.objectContaining({
      isUpdateChildCategoriesColor: false,
    }))
  })

  it('collects remaps from parent and child saves', async () => {
    let callCount = 0
    const saveCategory = vi.fn(() => {
      callCount++
      if (callCount === 1)
        return Promise.resolve({ convexId: 'convex_c1', localId: 'local_c1' })
      return Promise.resolve({ convexId: 'convex_c2', localId: 'local_c2' })
    })
    const deleteCategory = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Categories, 'local_c1', 'create', { name: 'Food', parentId: 0 }),
      makeOp(OfflineEntityType.Categories, 'local_c2', 'create', { name: 'Groceries', parentId: 'local_c1' }),
    ]

    await replayCategoryOps(ops, remapIds, { deleteCategory, saveCategory })
    expect(remapIds.get('local_c1')).toBe('convex_c1')
    expect(remapIds.get('local_c2')).toBe('convex_c2')
  })
})

// --- replayTrnOps ---

describe('replayTrnOps', () => {
  const wallets = { w1: {}, w2: {} }
  const categories = { food: {} }

  it('does nothing for empty ops', async () => {
    const saveTrn = vi.fn()
    const deleteTrn = vi.fn()
    const removeOp = vi.fn()
    const remapIds = new Map<string, string>()

    const orphanCount = await replayTrnOps([], remapIds, {
      deleteTrn,
      removeOfflineOp: removeOp,
      saveTrn,
    }, { categoriesItems: categories, walletsItems: wallets })
    expect(orphanCount).toBe(0)
    expect(saveTrn).not.toHaveBeenCalled()
    expect(deleteTrn).not.toHaveBeenCalled()
  })

  it('calls saveTrn for valid create ops', async () => {
    const saveTrn = vi.fn()
    const deleteTrn = vi.fn()
    const removeOp = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Trns, 't1', 'create', {
        amount: 100,
        categoryId: 'food',
        date: 1000,
        type: TrnType.Expense,
        updatedAt: 1000,
        walletId: 'w1',
      }),
    ]

    const orphanCount = await replayTrnOps(ops, remapIds, {
      deleteTrn,
      removeOfflineOp: removeOp,
      saveTrn,
    }, { categoriesItems: categories, walletsItems: wallets })
    expect(orphanCount).toBe(0)
    expect(saveTrn).toHaveBeenCalledTimes(1)
  })

  it('calls deleteTrn for delete ops', async () => {
    const saveTrn = vi.fn()
    const deleteTrn = vi.fn()
    const removeOp = vi.fn()
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Trns, 't1', 'delete'),
    ]

    await replayTrnOps(ops, remapIds, {
      deleteTrn,
      removeOfflineOp: removeOp,
      saveTrn,
    }, { categoriesItems: categories, walletsItems: wallets })
    expect(deleteTrn).toHaveBeenCalledWith('t1')
    expect(saveTrn).not.toHaveBeenCalled()
  })

  it('skips orphaned trns and returns orphan count', async () => {
    const saveTrn = vi.fn()
    const deleteTrn = vi.fn()
    const removeOp = vi.fn(() => Promise.resolve())
    const remapIds = new Map<string, string>()
    const ops = [
      makeOp(OfflineEntityType.Trns, 't1', 'create', {
        amount: 100,
        categoryId: 'food',
        date: 1000,
        type: TrnType.Expense,
        updatedAt: 1000,
        walletId: 'missing_wallet',
      }),
    ]

    const orphanCount = await replayTrnOps(ops, remapIds, {
      deleteTrn,
      removeOfflineOp: removeOp,
      saveTrn,
    }, { categoriesItems: categories, walletsItems: wallets })
    expect(orphanCount).toBe(1)
    expect(saveTrn).not.toHaveBeenCalled()
    expect(removeOp).toHaveBeenCalledWith(OfflineEntityType.Trns, 't1')
  })

  it('remaps wallet and category IDs before saving', async () => {
    const saveTrn = vi.fn()
    const deleteTrn = vi.fn()
    const removeOp = vi.fn()
    const remapIds = new Map([['local_w', 'w1'], ['local_c', 'food']])
    const ops = [
      makeOp(OfflineEntityType.Trns, 't1', 'create', {
        amount: 100,
        categoryId: 'local_c',
        date: 1000,
        type: TrnType.Expense,
        updatedAt: 1000,
        walletId: 'local_w',
      }),
    ]

    await replayTrnOps(ops, remapIds, {
      deleteTrn,
      removeOfflineOp: removeOp,
      saveTrn,
    }, { categoriesItems: categories, walletsItems: wallets })
    expect(saveTrn).toHaveBeenCalledWith(expect.objectContaining({
      values: expect.objectContaining({ categoryId: 'food', walletId: 'w1' }),
    }))
  })
})

// --- replaySettingsOps ---

describe('replaySettingsOps', () => {
  it('does nothing for empty ops', async () => {
    const saveBaseCurrency = vi.fn()
    const saveLocale = vi.fn()

    await replaySettingsOps([], { saveBaseCurrency, saveLocale })
    expect(saveBaseCurrency).not.toHaveBeenCalled()
    expect(saveLocale).not.toHaveBeenCalled()
  })

  it('calls saveBaseCurrency when baseCurrency is present', async () => {
    const saveBaseCurrency = vi.fn()
    const saveLocale = vi.fn()
    const ops = [
      makeOp(OfflineEntityType.UserSettings, 's1', 'update', { baseCurrency: 'EUR' }),
    ]

    await replaySettingsOps(ops, { saveBaseCurrency, saveLocale })
    expect(saveBaseCurrency).toHaveBeenCalledWith('EUR')
    expect(saveLocale).not.toHaveBeenCalled()
  })

  it('calls saveLocale when locale is present', async () => {
    const saveBaseCurrency = vi.fn()
    const saveLocale = vi.fn()
    const ops = [
      makeOp(OfflineEntityType.UserSettings, 's1', 'update', { locale: 'ru' }),
    ]

    await replaySettingsOps(ops, { saveBaseCurrency, saveLocale })
    expect(saveLocale).toHaveBeenCalledWith('ru')
    expect(saveBaseCurrency).not.toHaveBeenCalled()
  })

  it('calls both when both are present', async () => {
    const saveBaseCurrency = vi.fn()
    const saveLocale = vi.fn()
    const ops = [
      makeOp(OfflineEntityType.UserSettings, 's1', 'update', { baseCurrency: 'USD', locale: 'en' }),
    ]

    await replaySettingsOps(ops, { saveBaseCurrency, saveLocale })
    expect(saveBaseCurrency).toHaveBeenCalledWith('USD')
    expect(saveLocale).toHaveBeenCalledWith('en')
  })

  it('processes multiple settings ops', async () => {
    const saveBaseCurrency = vi.fn()
    const saveLocale = vi.fn()
    const ops = [
      makeOp(OfflineEntityType.UserSettings, 's1', 'update', { baseCurrency: 'EUR' }),
      makeOp(OfflineEntityType.UserSettings, 's2', 'update', { locale: 'ru' }),
    ]

    await replaySettingsOps(ops, { saveBaseCurrency, saveLocale })
    expect(saveBaseCurrency).toHaveBeenCalledTimes(1)
    expect(saveLocale).toHaveBeenCalledTimes(1)
  })
})
