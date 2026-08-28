import { describe, expect, it, vi } from 'vitest'

import type { Trns } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

vi.mock('~/components/amount/useAmount', () => ({ useAmount: () => ({}) }))
vi.mock('~/components/categories/useCategoriesStore', () => ({ useCategoriesStore: () => ({}) }))
vi.mock('~/components/currencies/useCurrenciesStore', () => ({ useCurrenciesStore: () => ({}) }))
vi.mock('~/components/trns/useTrnsStore', () => ({ useTrnsStore: () => ({}) }))
vi.mock('~/components/wallets/useWalletsStore', () => ({ useWalletsStore: () => ({}) }))

const { buildSortedStatReportSelection, buildStatReportSelection, projectStatReportSelection } = await import('~/components/stat/report/useStatReportData')

const items = {
  expense: { amount: 1, categoryId: 'food', date: 30, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
  income: { amount: 1, categoryId: 'salary', date: 20, type: TrnType.Income, updatedAt: 1, walletId: 'wallet' },
  sameDate: { amount: 1, categoryId: 'food', date: 30, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
  transferLeg: { amount: 1, categoryId: 'transfer', date: 40, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
} as Trns

describe('buildStatReportSelection', () => {
  it('sorts once and derives all category views from the selected sequence', () => {
    const result = buildStatReportSelection({
      effectiveCategoryIds: ['food'],
      quickCategoryIds: ['salary'],
      sourceIds: ['expense', 'sameDate', 'income'],
      trnsItems: items,
      trnsTypes: [TrnType.Expense, TrnType.Income],
    })

    expect(result.selectedIds).toEqual(['expense', 'sameDate', 'income'])
    expect(result.filteredIds).toEqual(['expense', 'sameDate'])
    expect(result.quickFilteredIds).toEqual(['income'])
  })

  it('keeps transfer-category rows out of expense selection', () => {
    const result = buildStatReportSelection({
      effectiveCategoryIds: [],
      quickCategoryIds: [],
      sourceIds: ['transferLeg', 'expense'],
      trnsItems: items,
      trnsTypes: [TrnType.Expense],
    })

    expect(result.selectedIds).toEqual(['expense'])
  })

  it('reads each transaction item once', () => {
    const reads = new Map<string, number>()
    const tracked = new Proxy(items, {
      get(target, key) {
        const id = String(key)
        reads.set(id, (reads.get(id) ?? 0) + 1)
        return Reflect.get(target, key)
      },
    })
    buildStatReportSelection({
      effectiveCategoryIds: [],
      quickCategoryIds: [],
      sourceIds: ['income', 'expense', 'sameDate'],
      trnsItems: tracked,
      trnsTypes: [TrnType.Expense, TrnType.Income],
    })

    expect([...reads.values()]).toEqual([1, 1, 1])
  })

  it('projects category drills without rereading transactions', () => {
    const reads = new Map<string, number>()
    const tracked = new Proxy(items, {
      get(target, key) {
        const id = String(key)
        reads.set(id, (reads.get(id) ?? 0) + 1)
        return Reflect.get(target, key)
      },
    })
    const sorted = buildSortedStatReportSelection({
      sourceIds: ['income', 'expense', 'sameDate'],
      trnsItems: tracked,
      trnsTypes: [TrnType.Expense, TrnType.Income],
    })

    expect(projectStatReportSelection(sorted, ['food'], [])).toEqual({
      filteredIds: ['expense', 'sameDate'],
      quickFilteredIds: ['expense', 'sameDate', 'income'],
      selectedIds: ['expense', 'sameDate', 'income'],
    })
    expect(projectStatReportSelection(sorted, ['salary'], ['food'])).toEqual({
      filteredIds: ['income'],
      quickFilteredIds: ['expense', 'sameDate'],
      selectedIds: ['expense', 'sameDate', 'income'],
    })
    expect([...reads.values()]).toEqual([1, 1, 1])
  })
})
