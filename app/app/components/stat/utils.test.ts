import { describe, expect, it } from 'vitest'

import { getNextWalletFilterIds, getSelectedType, getSelectedTypeForSum, getSortedFilterWalletsIds, getTypesMapping, getTypesToShow, getUsedWalletIds } from '~/components/stat/utils'
import { TrnType } from '~/components/trns/types'

describe('getTypesMapping', () => {
  it('includes transfers in the combined view so the transaction list can show them', () => {
    expect(getTypesMapping('combined')).toEqual([TrnType.Expense, TrnType.Income, TrnType.Transfer])
    expect(getTypesMapping('net')).toEqual([TrnType.Expense, TrnType.Income, TrnType.Transfer])
  })

  it('keeps expense/income views pure (no transfers)', () => {
    expect(getTypesMapping('expense')).toEqual([TrnType.Expense])
    expect(getTypesMapping('income')).toEqual([TrnType.Income])
  })
})

describe('getSelectedType', () => {
  it('returns filteredType for the combined report', () => {
    expect(getSelectedType('combined', 'expense', 'income')).toBe('expense')
    expect(getSelectedType('combined', 'net', undefined)).toBe('net')
  })

  it('returns statTab for expense/income tabs', () => {
    expect(getSelectedType('expense', 'net', 'income')).toBe('expense')
    expect(getSelectedType('income', 'expense', undefined)).toBe('income')
  })
})

describe('getSelectedTypeForSum', () => {
  it('returns summary for the combined report', () => {
    expect(getSelectedTypeForSum('combined', 'expense')).toBe('summary')
  })

  it('returns statTab for expense/income tabs', () => {
    expect(getSelectedTypeForSum('expense', 'income')).toBe('expense')
    expect(getSelectedTypeForSum('income', undefined)).toBe('income')
  })
})

describe('getTypesToShow', () => {
  it('returns both types for combined+net', () => {
    expect(getTypesToShow('combined', 'net', undefined)).toEqual(['income', 'expense'])
  })

  it('returns single type for combined+income', () => {
    expect(getTypesToShow('combined', 'income', undefined)).toEqual(['income'])
  })

  it('returns single type for combined+expense', () => {
    expect(getTypesToShow('combined', 'expense', undefined)).toEqual(['expense'])
  })

  it('returns statTab for expense tab', () => {
    expect(getTypesToShow('expense', 'net', 'income')).toEqual(['expense'])
  })

  it('returns statTab for income tab', () => {
    expect(getTypesToShow('income', 'net', undefined)).toEqual(['income'])
  })
})

describe('getSortedFilterWalletsIds', () => {
  it('shows filtered wallets past the configured count', () => {
    expect(getSortedFilterWalletsIds(['w5'], ['w1', 'w2', 'w3', 'w4', 'w5'], [], true, 2, 'recent')).toEqual(['w1', 'w2', 'w5'])
  })

  it('shows only the top N when nothing is filtered', () => {
    expect(getSortedFilterWalletsIds([], ['w1', 'w2', 'w3'], [], true, 2, 'recent')).toEqual(['w1', 'w2'])
  })

  it('shows wallets used in the current period regardless of the count', () => {
    expect(getSortedFilterWalletsIds([], ['w1'], ['w3', 'w2'], true, 1, 'period')).toEqual(['w3', 'w2'])
  })

  it('hides selected wallets outside a focused category period', () => {
    expect(getSortedFilterWalletsIds(['w1', 'w2'], [], ['w2'], true, 1, 'period', true)).toEqual(['w2'])
  })

  it('keeps selected wallets outside the period without a focused category', () => {
    expect(getSortedFilterWalletsIds(['w1'], [], ['w2'], true, 1, 'period')).toEqual(['w2', 'w1'])
  })

  it('falls back to the filtered ids when the section is hidden', () => {
    expect(getSortedFilterWalletsIds(['w3'], ['w1', 'w2', 'w3'], ['w2'], false, 2, 'period')).toEqual(['w3'])
  })
})

describe('getUsedWalletIds', () => {
  it('collects regular and transfer wallets in source order without duplicates', () => {
    expect(getUsedWalletIds(['transfer', 'expense', 'missing'], {
      expense: { amount: 10, categoryId: 'food', date: 2, type: TrnType.Expense, updatedAt: 2, walletId: 'cash' },
      transfer: { categoryId: 'transfer', date: 3, expenseAmount: 10, expenseWalletId: 'cash', incomeAmount: 10, incomeWalletId: 'card', type: TrnType.Transfer, updatedAt: 3 },
    })).toEqual(['cash', 'card'])
  })
})

describe('getNextWalletFilterIds', () => {
  it('adds wallets in multiple selection mode', () => {
    expect(getNextWalletFilterIds(['cash'], 'card', 'multiple')).toEqual(['cash', 'card'])
  })

  it('replaces the selected wallet in single selection mode', () => {
    expect(getNextWalletFilterIds(['cash'], 'card', 'single')).toEqual(['card'])
  })

  it('removes the clicked wallet in either mode when it is already selected', () => {
    expect(getNextWalletFilterIds(['cash'], 'cash', 'single')).toEqual([])
    expect(getNextWalletFilterIds(['cash', 'card'], 'cash', 'multiple')).toEqual(['card'])
  })
})
