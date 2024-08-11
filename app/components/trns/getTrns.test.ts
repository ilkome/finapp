import { describe, expect, it } from 'vitest'
import { getTrnsIds } from '~/components/trns/getTrns'
import { trnsItems } from '~~/mocks/trns'

describe('get Transactions IDs', () => {
  it('get Transactions IDs in Wallet Cash USD', () => {
    const walletsIds = ['walletCashUSD']
    const trnsIds = getTrnsIds({ trnsItems, walletsIds })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'transferCategoryNameIncomeWalletCashUSD30',
      'transferCategoryIdExpenseWalletCashUSD30',
    ]))
  })

  it('get Transactions IDs in Wallet RUB', () => {
    const walletsIds = ['walletRUB']
    const trnsIds = getTrnsIds({ trnsItems, walletsIds })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transferExpenseWalletRUB300IncomeWalletCreditUSD10',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
    ]))
  })

  it('get Transactions IDs in Wallets with deprecated Transfers', () => {
    const walletsIds = ['walletDeprecatedTransferIncome', 'walletDeprecatedTransferExpense']
    const trnsIds = getTrnsIds({ trnsItems, walletsIds })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transferOLDExpense2500Income3500',
    ]))
  })

  it('get All Transactions', () => {
    const trnsIds = getTrnsIds({ trnsItems })

    expect(trnsIds).toEqual(expect.arrayContaining([
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transactionIncomeWalletOneRUB700',
      'transactionExpenseWalletOneRUB900',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferExpenseWalletRUB300IncomeWalletCreditUSD10',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'transferCategoryNameIncomeWalletCashUSD30',
      'transferCategoryIdExpenseWalletCashUSD30',
      'transferOLDExpense2500Income3500',
    ]))
  })
})
