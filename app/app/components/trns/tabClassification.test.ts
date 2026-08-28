import { describe, expect, it } from 'vitest'
import { trnsItems } from '~~/mocks/trns'

import { getFilteredByTypeIds, getTypeCounts } from '~/components/trns/tabClassification'
import { TrnType } from '~/components/trns/types'

const allIds = Object.keys(trnsItems)

describe('getTypeCounts', () => {
  it('counts expense, income, transfer, adjustment correctly', () => {
    const counts = getTypeCounts(allIds, trnsItems)
    // expenses: transactionExpenseWalletCashUSD400 + transactionExpenseWalletOneRUB900 = 2
    expect(counts.expense).toBe(2)
    // incomes: transactionIncomeWalletCashUSD1000 + transactionIncomeWalletOneRUB700 = 2
    expect(counts.income).toBe(2)
    // transfers: 3 real transfers + singleLegTransferExpense + singleLegTransferIncome = 5
    expect(counts.transfer).toBe(5)
    // adjustments: 4
    expect(counts.adjustment).toBe(4)
  })

  it('counts single-leg transfer (categoryId=transfer, type=Expense) under transfer not expense', () => {
    const ids = ['singleLegTransferExpenseWalletCashUSD50']
    const counts = getTypeCounts(ids, trnsItems)
    expect(counts.transfer).toBe(1)
    expect(counts.expense).toBe(0)
  })

  it('counts single-leg transfer (categoryId=transfer, type=Income) under transfer not income', () => {
    const ids = ['singleLegTransferIncomeWalletCashUSD60']
    const counts = getTypeCounts(ids, trnsItems)
    expect(counts.transfer).toBe(1)
    expect(counts.income).toBe(0)
  })

  it('returns zeros for empty ids', () => {
    expect(getTypeCounts([], trnsItems)).toEqual({ adjustment: 0, expense: 0, income: 0, transfer: 0 })
  })

  it('skips missing ids', () => {
    expect(getTypeCounts(['nonexistent'], trnsItems)).toEqual({ adjustment: 0, expense: 0, income: 0, transfer: 0 })
  })
})

describe('getFilteredByTypeIds', () => {
  it('returns all ids when filterBy is all', () => {
    const ids = ['transactionExpenseWalletCashUSD400', 'transactionIncomeWalletCashUSD1000']
    expect(getFilteredByTypeIds(ids, trnsItems, 'all', undefined)).toEqual(ids)
  })

  it('filters to adjustment only', () => {
    const ids = [
      'adjustmentExpenseWalletCashUSD30',
      'transactionExpenseWalletCashUSD400',
      'singleLegTransferExpenseWalletCashUSD50',
    ]
    const result = getFilteredByTypeIds(ids, trnsItems, 'adjustment', undefined)
    expect(result).toEqual(['adjustmentExpenseWalletCashUSD30'])
  })

  it('filters to transfer including single-leg transfers', () => {
    const ids = [
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'singleLegTransferExpenseWalletCashUSD50',
      'transactionExpenseWalletCashUSD400',
    ]
    const result = getFilteredByTypeIds(ids, trnsItems, 'transfer', undefined)
    expect(result).toEqual([
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'singleLegTransferExpenseWalletCashUSD50',
    ])
  })

  it('filters to expense, excluding transfers', () => {
    const ids = [
      'transactionExpenseWalletCashUSD400',
      'singleLegTransferExpenseWalletCashUSD50',
      'transactionIncomeWalletCashUSD1000',
    ]
    const result = getFilteredByTypeIds(ids, trnsItems, 'expense', TrnType.Expense)
    expect(result).toEqual(['transactionExpenseWalletCashUSD400'])
  })

  it('filters to income, excluding single-leg transfers', () => {
    const ids = [
      'transactionIncomeWalletCashUSD1000',
      'singleLegTransferIncomeWalletCashUSD60',
      'transactionExpenseWalletCashUSD400',
    ]
    const result = getFilteredByTypeIds(ids, trnsItems, 'income', TrnType.Income)
    expect(result).toEqual(['transactionIncomeWalletCashUSD1000'])
  })
})
