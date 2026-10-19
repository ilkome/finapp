import { describe, expect, it } from 'vitest'
import { ratesBasedOnUsd as rates } from '~~/mocks/rates'
import { trnsItems } from '~~/mocks/trns'
import { walletsItems } from '~~/mocks/wallets'

import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { createToBase, getAmountInRate, getTotal, getWalletsTotals, MissingRateError } from '~/components/amount/getTotal'
import { TrnType } from '~/components/trns/types'

function toBaseFixture(rates: Rates, base: CurrencyCode) {
  return (amount: number, currency: CurrencyCode) => getAmountInRate(amount, currency, base, rates)
}

describe('getAmountInRate', () => {
  it('keeps the amount when currency is the base', () => {
    expect(getAmountInRate(40, 'USD', 'USD', rates)).toEqual(40)
  })

  it('converts RUB to USD base', () => {
    expect(getAmountInRate(70, 'RUB', 'USD', rates)).toEqual(1.0810810810810811)
  })

  it('converts RUB to EUR base', () => {
    expect(getAmountInRate(70, 'RUB', 'EUR', rates)).toEqual(1.0383135135135135)
  })
})

describe('total of Transactions', () => {
  it('correct empty result and correct total structure', () => {
    const trnsIds: TrnId[] = []

    const total = getTotal({
      baseCurrency: 'USD',
      toBase: toBaseFixture(rates, 'USD'),
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
      missingRates: [],
      net: 0,
      sumTransfers: 0,
    })
  })

  it('total in RUB Wallet converted to USD', () => {
    const trnsIds = ['transactionIncomeWalletOneRUB700']
    const toBase = toBaseFixture(rates, 'USD')

    const total = getTotal({
      baseCurrency: 'USD',
      toBase,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(10.81081081081081)
    expect(total.expense).toEqual(0)
    expect(total.net).toEqual(10.81)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in RUB Wallet converted to EUR', () => {
    const trnsIds = ['transactionIncomeWalletOneRUB700']
    const toBase = toBaseFixture(rates, 'EUR')

    const total = getTotal({
      baseCurrency: 'EUR',
      toBase,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(10.383135135135134)
    expect(total.expense).toEqual(0)
    expect(total.net).toEqual(10.38)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in USD Wallet converted to USD', () => {
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
    ]
    const toBase = toBaseFixture(rates, 'USD')

    const total = getTotal({
      baseCurrency: 'USD',
      toBase,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.net).toEqual(600)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('total in RUB, USD Wallets converted to EUR', () => {
    const trnsIds = [
      'transactionIncomeWalletOneRUB700',
      'transactionExpenseWalletCashUSD400',
    ]
    const toBase = toBaseFixture(rates, 'EUR')

    const total = getTotal({
      baseCurrency: 'EUR',
      toBase,
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(10.383135135135134)
    expect(total.expense).toEqual(384.176)
    expect(total.net).toEqual(-373.79)
    expect(total.incomeTransfers).toEqual(0)
    expect(total.expenseTransfers).toEqual(0)
    expect(total.sumTransfers).toEqual(0)
  })

  it('adjustment income adds to adjustment, expense subtracts', () => {
    const trnsIds = [
      'adjustmentIncomeWalletCashUSD200',
      'adjustmentExpenseWalletCashUSD50',
    ]

    const total = getTotal({
      baseCurrency: 'USD',
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.adjustment).toEqual(150)
    expect(total.income).toEqual(0)
    expect(total.expense).toEqual(0)
    expect(total.net).toEqual(0)
  })

  it('excludedCategoriesIds drops matching income/expense from totals', () => {
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
    ]

    const total = getTotal({
      baseCurrency: 'USD',
      excludedCategoriesIds: new Set(['expense']),
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(0)
    expect(total.net).toEqual(1000)
  })

  it('excludedCategoriesIds leaves transfer/adjustment buckets untouched', () => {
    const trnsIds = [
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'adjustmentIncomeWalletCashUSD200',
    ]

    const total = getTotal({
      baseCurrency: 'USD',
      excludedCategoriesIds: new Set(['transfer', 'adjustment']),
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.incomeTransfers).toEqual(40)
    expect(total.expenseTransfers).toEqual(40)
    expect(total.adjustment).toEqual(200)
    expect(total.income).toEqual(0)
    expect(total.expense).toEqual(0)
  })

  it('single-leg transfer lands in transfer buckets, not income/expense', () => {
    const trnsIds = [
      'singleLegTransferExpenseWalletCashUSD50',
      'singleLegTransferIncomeWalletCashUSD60',
    ]

    const total = getTotal({
      baseCurrency: 'USD',
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(0)
    expect(total.expense).toEqual(0)
    expect(total.incomeTransfers).toEqual(60)
    expect(total.expenseTransfers).toEqual(50)
  })

  it('transfers count both legs', () => {
    const trnsIds = [
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
    ]

    const total = getTotal({
      baseCurrency: 'USD',
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds,
      trnsItems,
      walletsItems,
    })

    expect(total.income).toEqual(1000)
    expect(total.expense).toEqual(400)
    expect(total.net).toEqual(600)
    expect(total.incomeTransfers).toEqual(40)
    expect(total.expenseTransfers).toEqual(40)
    expect(total.sumTransfers).toEqual(0)
  })

  it('rounds net and the transfer balance to the base currency, so equal sides give exactly 0', () => {
    // 100.10 + 200.70 sums to 300.79999999999995 in floating point.
    const trn = (type: TrnType.Expense | TrnType.Income, amount: number): TrnItem => ({ amount, categoryId: 'category1', date: 1, type, updatedAt: 1, walletId: 'walletCashUSD' })
    const transfer = (incomeAmount: number, expenseAmount: number): TrnItem => ({ categoryId: 'transfer', date: 1, expenseAmount, expenseWalletId: 'walletCreditUSD', incomeAmount, incomeWalletId: 'walletCashUSD', type: TrnType.Transfer, updatedAt: 1 })

    const total = getTotal({
      baseCurrency: 'USD',
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds: ['i1', 'i2', 'e', 't1', 't2'],
      trnsItems: {
        e: trn(TrnType.Expense, 300.8),
        i1: trn(TrnType.Income, 100.1),
        i2: trn(TrnType.Income, 200.7),
        t1: transfer(100.1, 300.8),
        t2: transfer(200.7, 0),
      },
      walletsItems,
    })

    expect(total.income).not.toBe(total.expense)
    expect(Object.is(total.net, 0)).toBe(true)
    expect(Object.is(total.sumTransfers, 0)).toBe(true)
  })
})

describe('createToBase', () => {
  const prod = (rates: Rates, missing: string[] = []) =>
    createToBase(() => 'USD', () => rates, { isDev: false, onMissing: c => missing.push(c) })

  it('converts at face value while rates are not loaded, reporting nothing', () => {
    const missing: string[] = []
    expect(prod({}, missing)(70, 'RUB')).toBe(70)
    expect(createToBase(() => 'USD', () => ({}), { isDev: true, onMissing: () => {} })(70, 'RUB')).toBe(70)
    expect(missing).toEqual([])
  })

  it('throws MissingRateError in dev when loaded rates lack the currency', () => {
    const toBase = createToBase(() => 'USD', () => rates, { isDev: true, onMissing: () => {} })
    expect(() => toBase(1, 'GBP')).toThrow(MissingRateError)
  })

  it('returns undefined in prod and reports the currency, including a missing base', () => {
    const missing: string[] = []
    expect(prod(rates, missing)(1, 'GBP')).toBeUndefined()
    expect(createToBase(() => 'GBP', () => rates, { isDev: false, onMissing: c => missing.push(c) })(1, 'USD')).toBeUndefined()
    expect(missing).toEqual(['GBP', 'GBP'])
  })

  it('converts normally when the rate is present', () => {
    expect(prod(rates)(70, 'RUB')).toBe(getAmountInRate(70, 'RUB', 'USD', rates))
  })

  it('getTotal excludes an amount without a rate and lists its currency', () => {
    const total = getTotal({
      baseCurrency: 'USD',
      toBase: prod({ USD: 1 }),
      trnsIds: ['transactionIncomeWalletOneRUB700', 'transactionIncomeWalletCashUSD1000'],
      trnsItems,
      walletsItems,
    })
    expect(total.income).toBe(1000)
    expect(total.missingRates).toEqual(['RUB'])
  })
})

describe('getTotal orphan trns', () => {
  it('skips an income/expense whose wallet is missing', () => {
    const total = getTotal({
      baseCurrency: 'USD',
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds: ['orphan'],
      trnsItems: { orphan: { amount: 100, categoryId: 'category1', date: 1, type: TrnType.Expense, updatedAt: 1, walletId: 'missingWallet' } },
      walletsItems,
    })

    expect(total.expense).toEqual(0)
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

  it('single-leg transfer moves the wallet balance by the full amount', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: trnsItems.singleLegTransferExpenseWalletCashUSD50!,
        t2: trnsItems.singleLegTransferIncomeWalletCashUSD60!,
      },
      walletsItems,
    })

    expect(totals.get('walletCashUSD')).toBe(10)
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

  it('snaps float noise to the currency precision, so a repaid credit is exactly 0', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: { amount: 0.1, categoryId: 'income', date: 1, type: TrnType.Income, updatedAt: 1, walletId: 'walletCashUSD' },
        t2: { amount: 0.2, categoryId: 'income', date: 1, type: TrnType.Income, updatedAt: 1, walletId: 'walletCashUSD' },
        t3: { amount: 0.3, categoryId: 'category1', date: 1, type: TrnType.Expense, updatedAt: 1, walletId: 'walletCashUSD' },
      },
      walletsItems,
    })

    expect(totals.get('walletCashUSD')).toBe(0)
  })

  it('keeps kopecks on a currency displayed without decimals', () => {
    const totals = getWalletsTotals({
      trnsItems: {
        t1: { amount: 1500000, categoryId: 'category1', date: 1, type: TrnType.Expense, updatedAt: 1, walletId: 'walletRUB' },
        t2: { amount: 24554.95, categoryId: 'income', date: 1, type: TrnType.Income, updatedAt: 1, walletId: 'walletRUB' },
      },
      walletsItems,
    })

    expect(totals.get('walletRUB')).toBe(-1475445.05)
  })
})
