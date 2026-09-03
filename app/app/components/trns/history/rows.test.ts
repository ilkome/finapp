import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'
import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { buildTransactionHistoryRows } from '~/components/trns/history/rows'
import { TrnType } from '~/components/trns/types'

const categories = {
  adjustment: { color: '', icon: '', name: 'Adjustment', parentId: 0, showInLastUsed: false, showInQuickSelector: false },
  food: { color: '', icon: '', name: 'Food', parentId: 'home', showInLastUsed: true, showInQuickSelector: false },
  home: { color: '', icon: '', name: 'Home', parentId: 0, showInLastUsed: true, showInQuickSelector: false },
  transfer: { color: '', icon: '', name: 'Transfer', parentId: 0, showInLastUsed: false, showInQuickSelector: false },
} as Categories

const wallets = {
  card: { color: '', currency: 'USD', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'Card', order: 1, type: 'cashless', updatedAt: 1 },
  cash: { color: '', currency: 'EUR', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'Cash', order: 0, type: 'cash', updatedAt: 1 },
} as Wallets

describe('buildTransactionHistoryRows', () => {
  it('projects category paths, signed base amounts, and transfer sides', () => {
    const trns = {
      expense: { amount: 100, categoryId: 'food', date: 1, type: TrnType.Expense, updatedAt: 1, walletId: 'cash' },
      transfer: { categoryId: 'transfer', date: 2, expenseAmount: 100, expenseWalletId: 'cash', incomeAmount: 110, incomeWalletId: 'card', type: TrnType.Transfer, updatedAt: 1 },
    } as Trns

    const result = buildTransactionHistoryRows({ baseCurrency: 'USD', categories, rates: { EUR: 2, USD: 1 }, trns, wallets })

    expect(result.unresolvedIds).toEqual([])
    expect(result.rows[0]).toMatchObject({ amountInBase: -50, categoryPath: 'Home / Food', walletIds: ['cash'] })
    expect(result.rows[1]).toMatchObject({ amountInBase: null, type: 'transfer', walletIds: ['cash', 'card'] })
  })

  it('reports rows whose wallet cannot be resolved', () => {
    const trns = {
      missing: { amount: 100, categoryId: 'food', date: 1, type: TrnType.Expense, updatedAt: 1, walletId: 'missing' },
    } as Trns

    expect(buildTransactionHistoryRows({ baseCurrency: 'USD', categories, rates: {}, trns, wallets })).toEqual({
      rows: [],
      unresolvedIds: ['missing'],
    })
  })
})
