import { describe, expect, it } from 'vitest'

import { getWalletPeriodTotals, sortWalletIdsByPeriodTotal } from '~/components/stat/walletPeriodTotals'

describe('getWalletPeriodTotals', () => {
  it('returns income minus expenses for every wallet', () => {
    expect(getWalletPeriodTotals({
      trnsIds: ['income', 'expense', 'other'],
      trnsItems: {
        expense: { categoryId: 'food', createdAt: 2, date: 2, fromAmount: 4000, fromWalletId: 'cash', type: 'expense', updatedAt: 2 },
        income: { categoryId: 'salary', createdAt: 1, date: 1, toAmount: 10000, toWalletId: 'cash', type: 'income', updatedAt: 1 },
        other: { categoryId: 'food', createdAt: 3, date: 3, fromAmount: 3000, fromWalletId: 'card', type: 'expense', updatedAt: 3 },
      },
    })).toEqual({ card: -3000, cash: 6000 })
  })

  it('excludes adjustments, transfers and explicitly excluded categories', () => {
    expect(getWalletPeriodTotals({
      excludedCategoryIds: new Set(['hidden']),
      trnsIds: ['adjustment', 'hidden', 'transfer'],
      trnsItems: {
        adjustment: { createdAt: 1, date: 1, toAmount: 2000, toWalletId: 'cash', type: 'adjustment', updatedAt: 1 },
        hidden: { categoryId: 'hidden', createdAt: 2, date: 2, toAmount: 3000, toWalletId: 'cash', type: 'income', updatedAt: 2 },
        transfer: { createdAt: 3, date: 3, fromAmount: 1000, fromWalletId: 'cash', toAmount: 1000, toWalletId: 'card', type: 'transfer', updatedAt: 3 },
      },
    })).toEqual({})
  })
})

describe('sortWalletIdsByPeriodTotal', () => {
  it('uses the category order for income, expenses, and empty wallets', () => {
    expect(sortWalletIdsByPeriodTotal(
      ['empty', 'expense-small', 'income-small', 'expense-large', 'income-large'],
      { 'expense-large': -400, 'expense-small': -100, 'income-large': 500, 'income-small': 200 },
    )).toEqual(['income-large', 'income-small', 'expense-large', 'expense-small', 'empty'])
  })
})
