import { describe, expect, it } from 'vitest'

import type { TransactionHistoryRow } from '~/components/trns/history/types'

import { matchesHistoryAmount, matchesHistoryCategories, matchesHistoryDate, matchesHistoryDescription, matchesHistorySearch, matchesHistoryType, matchesHistoryWallets } from '~/components/trns/history/filters'
import { TrnType } from '~/components/trns/types'

const row = {
  amountInBase: -100,
  categoryColor: '',
  categoryIcon: '',
  categoryId: 'food',
  categoryLabel: 'Food',
  categoryPath: 'Home / Food',
  currencyCodes: ['USD'],
  date: Date.UTC(2026, 8, 3),
  description: 'Weekly groceries',
  id: 'a',
  trn: { amount: 100, categoryId: 'food', date: Date.UTC(2026, 8, 3), type: TrnType.Expense, updatedAt: 1, walletId: 'card' },
  type: 'expense',
  walletIds: ['card'],
  walletLabel: 'Daily card',
} satisfies TransactionHistoryRow

describe('history filters', () => {
  it('searches description, category path, and wallet', () => {
    expect(matchesHistorySearch(row, 'grocer')).toBe(true)
    expect(matchesHistorySearch(row, 'home')).toBe(true)
    expect(matchesHistorySearch(row, 'daily')).toBe(true)
    expect(matchesHistorySearch(row, 'salary')).toBe(false)
  })

  it('combines entity and type semantics', () => {
    expect(matchesHistoryType(row, 'expense')).toBe(true)
    expect(matchesHistoryType(row, 'income')).toBe(false)
    expect(matchesHistoryWallets(row, ['card'])).toBe(true)
    expect(matchesHistoryWallets(row, ['cash'])).toBe(false)
    expect(matchesHistoryCategories(row, ['food'])).toBe(true)
    expect(matchesHistoryCategories(row, ['travel'])).toBe(false)
  })

  it('filters by description presence, date, and signed base amount', () => {
    expect(matchesHistoryDescription(row, 'with')).toBe(true)
    expect(matchesHistoryDescription({ ...row, description: '' }, 'without')).toBe(true)
    expect(matchesHistoryDate(row, { end: Date.UTC(2026, 8, 5), start: Date.UTC(2026, 8, 1) })).toBe(true)
    expect(matchesHistoryDate(row, { start: Date.UTC(2026, 8, 4) })).toBe(false)
    expect(matchesHistoryAmount(row, { max: -50, min: -150 })).toBe(true)
    expect(matchesHistoryAmount(row, { min: 0 })).toBe(false)
    expect(matchesHistoryAmount({ ...row, amountInBase: null }, { min: -150 })).toBe(false)
  })
})
