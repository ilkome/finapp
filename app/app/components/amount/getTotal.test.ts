import { describe, expect, it } from 'vitest'
import { ratesBasedOnUsd as rates } from '~~/mocks/rates'
import { trnsItems } from '~~/mocks/trns'
import { walletsItems } from '~~/mocks/wallets'

import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'

import { createToBase, getAmountInRate, getTotal, getWalletsTotals, MissingRateError } from '~/components/amount/getTotal'

function toBaseFixture(rates: Rates, base: CurrencyCode) {
  return (amount: number, currency: CurrencyCode) => getAmountInRate(amount, currency, base, rates)
}

function total(trnsIds: TrnId[], base: CurrencyCode = 'USD', excludedCategoriesIds?: Set<string>) {
  return getTotal({ excludedCategoriesIds, toBase: toBaseFixture(rates, base), trnsIds, trnsItems, walletsItems })
}

describe('getAmountInRate', () => {
  it('keeps the amount when currency is the base', () => {
    expect(getAmountInRate(4000, 'USD', 'USD', rates)).toBe(4000)
  })

  it('converts minor units across currencies, unrounded', () => {
    expect(getAmountInRate(7000, 'RUB', 'USD', rates)).toBeCloseTo(108.108108, 5)
    expect(getAmountInRate(7000, 'RUB', 'EUR', rates)).toBeCloseTo(103.831351, 5)
  })

  it('applies the difference of scales', () => {
    expect(getAmountInRate(100, 'USD', 'JPY', { JPY: 150, USD: 1 })).toBe(150)
    expect(getAmountInRate(150, 'JPY', 'USD', { JPY: 150, USD: 1 })).toBe(100)
  })
})

describe('getTotal', () => {
  it('is all zeros for no transactions', () => {
    expect(total([])).toEqual({
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

  it('converts into base minor units and rounds once', () => {
    expect(total(['transactionIncomeWalletOneRUB700']).income).toBe(1081)
    expect(total(['transactionIncomeWalletOneRUB700'], 'EUR').income).toBe(1038)
  })

  it('sums income and expense of one currency', () => {
    const result = total(['transactionIncomeWalletCashUSD1000', 'transactionExpenseWalletCashUSD400'])
    expect([result.income, result.expense, result.net]).toEqual([100000, 40000, 60000])
  })

  it('signs an adjustment by its side', () => {
    expect(total(['adjustmentIncomeWalletCashUSD200', 'adjustmentExpenseWalletCashUSD50']).adjustment).toBe(15000)
  })

  it('drops excluded categories from income and expense only', () => {
    const result = total(['transactionIncomeWalletCashUSD1000', 'transactionExpenseWalletCashUSD400', 'adjustmentIncomeWalletCashUSD30'], 'USD', new Set(['income']))
    expect([result.income, result.expense, result.adjustment]).toEqual([0, 40000, 3000])
  })

  it('puts a one-sided transfer in the transfer buckets, never income or expense', () => {
    const result = total(['singleLegTransferExpenseWalletCashUSD50', 'singleLegTransferIncomeWalletCashUSD60'])
    expect([result.income, result.expense, result.incomeTransfers, result.expenseTransfers, result.sumTransfers]).toEqual([0, 0, 6000, 5000, 1000])
  })

  it('counts both sides of a transfer, so an in-app transfer of one currency sums to 0', () => {
    const result = total(['transferExpenseWalletCreditUSD40IncomeWalletCashUSD40'])
    expect([result.incomeTransfers, result.expenseTransfers, result.sumTransfers]).toEqual([4000, 4000, 0])
  })

  it('skips a side whose wallet is missing', () => {
    const result = getTotal({
      toBase: toBaseFixture(rates, 'USD'),
      trnsIds: ['orphan'],
      trnsItems: { orphan: { categoryId: 'category1', createdAt: 1, date: 0, fromAmount: 100, fromWalletId: 'missingWallet', type: 'expense', updatedAt: 1 } },
      walletsItems,
    })
    expect(result.expense).toBe(0)
  })
})

describe('createToBase', () => {
  const prod = (rates: Rates, missing: string[] = []) =>
    createToBase(() => 'USD', () => rates, { isDev: false, onMissing: c => missing.push(c) })

  it('converts at face value while rates are not loaded, reporting nothing', () => {
    const missing: string[] = []
    expect(prod({}, missing)(7000, 'RUB')).toBe(7000)
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

  it('converts like getAmountInRate when the rate is present', () => {
    expect(prod(rates)(7000, 'RUB')).toBe(getAmountInRate(7000, 'RUB', 'USD', rates))
  })

  it('leaves an amount without a rate out of getTotal and lists its currency', () => {
    const result = getTotal({
      toBase: prod({ USD: 1 }),
      trnsIds: ['transactionIncomeWalletOneRUB700', 'transactionIncomeWalletCashUSD1000'],
      trnsItems,
      walletsItems,
    })
    expect(result.income).toBe(100000)
    expect(result.missingRates).toEqual(['RUB'])
  })
})

describe('getWalletsTotals', () => {
  const totals = (ids: TrnId[]) => getWalletsTotals({ trnsItems: Object.fromEntries(ids.map(id => [id, trnsItems[id]!])), walletsItems })

  it('is empty for no transactions', () => {
    expect(totals([]).size).toBe(0)
  })

  it('is what flows in minus what flows out, for every type', () => {
    const result = totals([
      'transactionIncomeWalletCashUSD1000',
      'transactionExpenseWalletCashUSD400',
      'transferExpenseWalletCashUSD10IncomeWalletRUB700',
      'transferExpenseWalletCreditUSD40IncomeWalletCashUSD40',
      'adjustmentIncomeWalletCashUSD30',
      'adjustmentExpenseWalletCashUSD30',
      'singleLegTransferExpenseWalletCashUSD50',
      'singleLegTransferIncomeWalletCashUSD60',
    ])
    // 1000 - 400 - 10 + 40 + 30 - 30 - 50 + 60 = 640
    expect(result.get('walletCashUSD')).toBe(64000)
    expect(result.get('walletRUB')).toBe(70000)
    expect(result.get('walletCreditUSD')).toBe(-4000)
  })

  it('is exact in minor units, so a repaid credit is exactly 0', () => {
    const result = getWalletsTotals({
      trnsItems: {
        t1: { createdAt: 1, date: 0, toAmount: 10, toWalletId: 'walletCashUSD', type: 'transfer', updatedAt: 1 },
        t2: { createdAt: 1, date: 0, toAmount: 20, toWalletId: 'walletCashUSD', type: 'transfer', updatedAt: 1 },
        t3: { categoryId: 'category1', createdAt: 1, date: 0, fromAmount: 30, fromWalletId: 'walletCashUSD', type: 'expense', updatedAt: 1 },
      },
      walletsItems,
    })
    expect(result.get('walletCashUSD')).toBe(0)
  })
})
