import { describe, expect, it } from 'vitest'
import { getTrnsIds } from '~/components/trns/getTrns'
import { trnsItems } from '~/mocks/trns'

describe('Get Transactions IDs', () => {
  it('Get Transactions IDs in Wallet Cash USD', () => {
    const walletsIds = ['walletCashUSD']
    const trnsIds = getTrnsIds({ walletsIds, trnsItems })

    expect(trnsIds).toEqual([
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'transferCategoryNameIncomeWalletCashUSD30',
      'transferCategoryIdExpenseWalletCashUSD30',
    ])
  })

  it('Get Transactions IDs in Wallet RUB', () => {
    const walletsIds = ['walletRUB']
    const trnsIds = getTrnsIds({ walletsIds, trnsItems })

    expect(trnsIds).toEqual([
      'transferExpenseWalletRUB300IncomeWalletCreditUSD10',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
    ])
  })

  it('Get Transactions IDs in Wallets with deprecated Transfers', () => {
    const walletsIds = ['walletDeprecatedTransferIncome', 'walletDeprecatedTransferExpense']
    const trnsIds = getTrnsIds({ walletsIds, trnsItems })

    expect(trnsIds).toEqual([
      'transferOLDExpense2500Income3500',
    ])
  })

  it('Get All Transactions', () => {
    const trnsIds = getTrnsIds({ trnsItems })

    expect(trnsIds).toEqual([
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
    ])
  })
})
