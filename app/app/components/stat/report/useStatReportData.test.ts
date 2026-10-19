import { describe, expect, it, vi } from 'vitest'

import type { Trns, TrnType } from '~/components/trns/types'

vi.mock('~/components/amount/useAmount', () => ({ useAmount: () => ({}) }))
vi.mock('~/components/categories/useCategoriesStore', () => ({ useCategoriesStore: () => ({}) }))
vi.mock('~/components/currencies/useCurrenciesStore', () => ({ useCurrenciesStore: () => ({}) }))
vi.mock('~/components/trns/useTrnsStore', () => ({ useTrnsStore: () => ({}) }))
vi.mock('~/components/wallets/useWalletsStore', () => ({ useWalletsStore: () => ({}) }))

const { buildSortedStatReportSelection, buildStatReportSelection, filterStatReportSelectionSource, projectStatReportSelection } = await import('~/components/stat/report/useStatReportData')

const items = {
  expense: { categoryId: 'food', createdAt: 1, date: 30, fromAmount: 100, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
  income: { categoryId: 'salary', createdAt: 1, date: 20, toAmount: 100, toWalletId: 'wallet', type: 'income', updatedAt: 1 },
  sameDate: { categoryId: 'food', createdAt: 1, date: 30, fromAmount: 100, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
  transferLeg: { createdAt: 1, date: 40, fromAmount: 100, fromWalletId: 'wallet', type: 'transfer', updatedAt: 1 },
} satisfies Trns

describe('buildStatReportSelection', () => {
  it('sorts once and derives all category views from the selected sequence', () => {
    const result = buildStatReportSelection({
      effectiveCategoryIds: ['food'],
      quickCategoryIds: ['salary'],
      sourceIds: ['expense', 'sameDate', 'income'],
      trnsItems: items,
      trnsTypes: ['expense', 'income'],
    })

    expect(result.selectedIds).toEqual(['expense', 'sameDate', 'income'])
    expect(result.filteredIds).toEqual(['expense', 'sameDate'])
    expect(result.quickFilteredIds).toEqual(['income'])
  })

  it('limits a shared maximum-range selection to the selected chart interval', () => {
    const source = buildSortedStatReportSelection({
      sourceIds: ['expense', 'sameDate', 'income'],
      trnsItems: items,
      trnsTypes: ['expense', 'income'],
    })

    expect(filterStatReportSelectionSource({
      dates: { end: 30, start: 30 },
      source,
      trnsItems: items,
      trnsTypes: ['expense', 'income'],
    }).map(record => record.id)).toEqual(['expense', 'sameDate'])
  })

  it('keeps transfers out of expense selection', () => {
    const result = buildStatReportSelection({
      effectiveCategoryIds: [],
      quickCategoryIds: [],
      sourceIds: ['transferLeg', 'expense'],
      trnsItems: items,
      trnsTypes: ['expense'],
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
      trnsTypes: ['expense', 'income'],
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
      trnsTypes: ['expense', 'income'],
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

describe('buildSortedStatReportSelection', () => {
  it('matches sorting every candidate by date and then filtering by type', () => {
    const trnsItems = Object.fromEntries(Array.from({ length: 200 }, (_, i) => [
      `t${i}`,
      { categoryId: `c${i % 7}`, createdAt: 1, date: (i * 37) % 50, fromAmount: 100, fromWalletId: 'w', type: (['expense', 'income', 'transfer'] as const)[i % 3], updatedAt: 1 },
    ])) as unknown as Trns
    const sourceIds = [...Object.keys(trnsItems), 'missing']
    const trnsTypes: TrnType[] = ['expense', 'income']
    const expected = sourceIds
      .map(id => ({ id, trn: trnsItems[id] }))
      .sort((a, b) => (b.trn?.date ?? 0) - (a.trn?.date ?? 0))
      .filter(({ trn }) => trn && trnsTypes.includes(trn.type))
      .map(({ id, trn }) => ({ categoryId: trn!.categoryId, id }))

    const result = buildSortedStatReportSelection({ sourceIds, trnsItems, trnsTypes })

    expect(result.map(({ categoryId, id }) => ({ categoryId, id }))).toEqual(expected)
  })
})
