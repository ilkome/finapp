import { describe, expect, it } from 'vitest'
import { ratesBasedOnUsd as rates } from '~~/mocks/rates'
import { trnsItems } from '~~/mocks/trns'
import { walletsItems } from '~~/mocks/wallets'

import type { TrnId } from '~/components/trns/types'

import { getTotal } from '~/components/amount/getTotal'
import { getTransferCategoriesIds } from '~/components/categories/utils'
import { mockCategories } from '~/components/categories/utils.test'

const transferCategoriesIds = getTransferCategoriesIds(mockCategories)

describe('total of Transactions', () => {
  it('correct empty result and correct total structure', () => {
    const trnsIds: TrnId[] = []

    const total = getTotal({
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total).toEqual({
      expense: 0,
      expenseTransfers: 0,
      income: 0,
      incomeTransfers: 0,
      sum: 0,
      sumTransfers: 0,
    })
  })

  it('total in RUB Wallet converted to USD', () => {
    const trnsIds = ['transactionIncomeWalletOneRUB700']
    const baseCurrencyCode = 'USD'

    const total = getTotal({
      baseCurrencyCode,
      rates,
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(10.81081081081081)
    expect(total.expense).toEqual(0)
    expect(total.sum).toEqual(10.81081081081081)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in RUB Wallet converted to EUR', () => {
    const trnsIds = ['transactionIncomeWalletOneRUB700']
    const baseCurrencyCode = 'EUR'

    const total = getTotal({
      baseCurrencyCode,
      rates,
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(10.383135135135134)
    expect(total.expense).toEqual(0)
    expect(total.sum).toEqual(10.383135135135134)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in USD Wallet converted to USD', () => {
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
    ]
    const baseCurrencyCode = 'USD'

    const total = getTotal({
      baseCurrencyCode,
      rates,
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.sum).toEqual(600)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in RUB, USD Wallets converted to EUR', () => {
    const trnsIds = [
      'transactionIncomeWalletOneRUB700',
      'transactionExpenseWalletCashUSD400',
    ]
    const baseCurrencyCode = 'EUR'

    const total = getTotal({
      baseCurrencyCode,
      rates,
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(10.383135135135134)
    expect(total.expense).toEqual(384.176)
    expect(total.sum).toEqual(-373.79286486486484)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in Wallet Cash USD with Transfers', () => {
    const walletsIds = ['walletCashUSD']
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferCategoryNameIncomeWalletCashUSD30',
      'transferCategoryIdExpenseWalletCashUSD30',
    ]

    const total = getTotal({
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsIds,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.sum).toEqual(600)
    expect(total.incomeTransfers).toEqual(70)
    expect(total.expenseTransfers).toEqual(40)
    expect(total.sumTransfers).toEqual(30)
  })

  it('total of Transfers when no Wallets provided', () => {
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'transferCategoryNameIncomeWalletCashUSD30',
      'transferCategoryIdExpenseWalletCashUSD30',
    ]

    const total = getTotal({
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.sum).toEqual(600)
    expect(total.incomeTransfers).toEqual(70)
    expect(total.expenseTransfers).toEqual(70)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total of Transfers with deprecated Transfer type when no Wallets provided', () => {
    const trnsIds = ['transferOLDExpense2500Income3500']

    const total = getTotal({
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.incomeTransfers).toEqual(3500)
    expect(total.expenseTransfers).toEqual(2500)
    expect(total.sumTransfers).toEqual(1000)
  })

  it('total of Transfers with deprecated Transfer type', () => {
    const walletsIds = ['walletDeprecatedTransferIncome', 'walletDeprecatedTransferExpense']
    const trnsIds = ['transferOLDExpense2500Income3500']

    const total = getTotal({
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsIds,
      walletsItems,
    })

    expect(total.incomeTransfers).toEqual(3500)
    expect(total.expenseTransfers).toEqual(2500)
    expect(total.sumTransfers).toEqual(1000)
  })
})
