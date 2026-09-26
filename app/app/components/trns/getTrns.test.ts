import { describe, expect, it } from 'vitest'
import { trnsItems } from '~~/mocks/trns'

import { filterTrnsIds } from '~/components/trns/getTrns'
import { TrnType } from '~/components/trns/types'

describe('get Transactions IDs', () => {
  it('get Transactions IDs in Wallet Cash USD', () => {
    const walletsIds = ['walletCashUSD']
    const trnsIds = filterTrnsIds({ trnsItems, walletsIds })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'adjustmentIncomeWalletCashUSD30',
      'adjustmentExpenseWalletCashUSD30',
    ]))
  })

  it('get Transactions IDs in Wallet RUB', () => {
    const walletsIds = ['walletRUB']
    const trnsIds = filterTrnsIds({ trnsItems, walletsIds })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transferExpenseWalletRUB300IncomeWalletCreditUSD10',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
    ]))
  })

  it('get All Transactions', () => {
    const trnsIds = filterTrnsIds({ trnsItems })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transactionIncomeWalletOneRUB700',
      'transactionExpenseWalletOneRUB900',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferExpenseWalletRUB300IncomeWalletCreditUSD10',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'adjustmentIncomeWalletCashUSD30',
      'adjustmentExpenseWalletCashUSD30',
    ]))
  })

  it('drops a single-leg transfer from the Expense type filter', () => {
    const trnsIds = filterTrnsIds({ trnsItems, trnsTypes: [TrnType.Expense] })

    expect(trnsIds).not.toContain('singleLegTransferExpenseWalletCashUSD50')
  })

  it('keeps a single-leg transfer when Transfer is among the requested types', () => {
    const trnsIds = filterTrnsIds({ trnsItems, trnsTypes: [TrnType.Expense, TrnType.Income, TrnType.Transfer] })

    expect(trnsIds).toContain('singleLegTransferExpenseWalletCashUSD50')
  })

  it('sorts a copy, never the caller\'s array', () => {
    const trnsIds = Object.keys(trnsItems)
    const before = [...trnsIds]
    const sorted = filterTrnsIds({ sort: true, trnsIds, trnsItems })

    expect(trnsIds).toEqual(before)
    expect(sorted).not.toBe(trnsIds)
    expect(sorted.map(id => trnsItems[id]!.date)).toEqual([...sorted.map(id => trnsItems[id]!.date)].sort((a, b) => b - a))
  })
})
