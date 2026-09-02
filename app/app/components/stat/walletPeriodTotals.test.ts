import { describe, expect, it } from 'vitest'

import { getWalletPeriodTotals, sortWalletIdsByPeriodTotal } from '~/components/stat/walletPeriodTotals'
import { TrnType } from '~/components/trns/types'

describe('getWalletPeriodTotals', () => {
  it('returns income minus expenses for every wallet', () => {
    expect(getWalletPeriodTotals({
      trnsIds: ['income', 'expense', 'other'],
      trnsItems: {
        expense: { amount: 40, categoryId: 'food', date: 2, type: TrnType.Expense, updatedAt: 2, walletId: 'cash' },
        income: { amount: 100, categoryId: 'salary', date: 1, type: TrnType.Income, updatedAt: 1, walletId: 'cash' },
        other: { amount: 30, categoryId: 'food', date: 3, type: TrnType.Expense, updatedAt: 3, walletId: 'card' },
      },
    })).toEqual({ card: -30, cash: 60 })
  })

  it('excludes system and explicitly excluded categories', () => {
    expect(getWalletPeriodTotals({
      excludedCategoryIds: new Set(['hidden']),
      trnsIds: ['adjustment', 'hidden', 'transfer'],
      trnsItems: {
        adjustment: { amount: 20, categoryId: 'adjustment', date: 1, type: TrnType.Income, updatedAt: 1, walletId: 'cash' },
        hidden: { amount: 30, categoryId: 'hidden', date: 2, type: TrnType.Income, updatedAt: 2, walletId: 'cash' },
        transfer: { categoryId: 'transfer', date: 3, expenseAmount: 10, expenseWalletId: 'cash', incomeAmount: 10, incomeWalletId: 'card', type: TrnType.Transfer, updatedAt: 3 },
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
