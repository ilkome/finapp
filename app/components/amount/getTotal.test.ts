import { describe, expect, it } from 'vitest'
import { ratesBasedOnUsd as rates } from '~~/mocks/rates'
import { trnsItems } from '~~/mocks/trns'
import { walletsItems } from '~~/mocks/wallets'

import type { TrnId } from '~/components/trns/types'

import { getTotal, getWalletsTotals } from '~/components/amount/getTotal'

describe('total of Transactions', () => {
  it('correct empty result and correct total structure', () => {
    const trnsIds: TrnId[] = []

    const total = getTotal({
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total).toEqual({
      adjustment: 0,
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

  it('total in Wallet Cash USD with Transfers and adjustments', () => {
    const walletsIds = ['walletCashUSD']
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'adjustmentIncomeWalletCashUSD30',
      'adjustmentExpenseWalletCashUSD30',
    ]

    const total = getTotal({
      trnsIds,
      trnsItems,
      walletsIds,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.sum).toEqual(600)
    expect(total.incomeTransfers).toEqual(40)
    expect(total.expenseTransfers).toEqual(10)
    expect(total.sumTransfers).toEqual(30)
    expect(total.adjustment).toEqual(0)
  })

  it('adjustment income adds to adjustment, expense subtracts', () => {
    const trnsIds = [
      'adjustmentIncomeWalletCashUSD200',
      'adjustmentExpenseWalletCashUSD50',
    ]

    const total = getTotal({
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.adjustment).toEqual(150)
    expect(total.income).toEqual(0)
    expect(total.expense).toEqual(0)
    expect(total.sum).toEqual(0)
  })

  it('total of Transfers when no Wallets filter provided', () => {
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
    ]

    const total = getTotal({
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.sum).toEqual(600)
    expect(total.incomeTransfers).toEqual(40)
    expect(total.expenseTransfers).toEqual(40)
    expect(total.sumTransfers).toEqual(0)
  })
})

describe('getWalletsTotals', () => {
  it('returns empty map for empty trns', () => {
    const totals = getWalletsTotals({
      trnsItems: {},
      walletsItems,
    })

    expect(totals.size).toBe(0)
  })

  it('computes wallet balance from income and expense', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: trnsItems.transactionIncomeWalletCashUSD1000!,
        t2: trnsItems.transactionExpenseWalletCashUSD400!,
      },
      walletsItems,
    })

    expect(totals.get('walletCashUSD')).toBe(600)
  })

  it('handles transfers — adds to income wallet, subtracts from expense wallet', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: trnsItems.transferExpenseWalletCashUSD10IncomeWalletRUB700!,
      },
      walletsItems,
    })

    expect(totals.get('walletCashUSD')).toBe(-10)
    expect(totals.get('walletRUB')).toBe(700)
  })

  it('handles adjustments as income/expense on wallet', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: trnsItems.adjustmentIncomeWalletCashUSD200!,
        t2: trnsItems.adjustmentExpenseWalletCashUSD50!,
      },
      walletsItems,
    })

    expect(totals.get('walletCashUSD')).toBe(150)
  })

  it('computes full balance for walletCashUSD with mixed trns', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: trnsItems.transactionIncomeWalletCashUSD1000!,
        t2: trnsItems.transactionExpenseWalletCashUSD400!,
        t3: trnsItems.transferExpenseWalletCashUSD10IncomeWalletRUB700!,
        t4: trnsItems.transferExpenseWalletCreditUSD40IncomeWalletCashUSD40!,
        t5: trnsItems.adjustmentIncomeWalletCashUSD30!,
        t6: trnsItems.adjustmentExpenseWalletCashUSD30!,
      },
      walletsItems,
    })

    // 1000 - 400 - 10 + 40 + 30 - 30 = 630
    expect(totals.get('walletCashUSD')).toBe(630)
    expect(totals.get('walletRUB')).toBe(700)
    expect(totals.get('walletCreditUSD')).toBe(-40)
  })

  it('converts currencies when rates provided', () => {
    const totals = getWalletsTotals({
      baseCurrencyCode: 'USD',
      rates,
      trnsItems: {
        t1: trnsItems.transactionIncomeWalletOneRUB700!,
      },
      walletsItems,
    })

    expect(totals.get('walletOneRUB')).toBeCloseTo(10.81, 1)
  })
})
