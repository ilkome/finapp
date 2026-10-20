import { describe, expect, it } from 'vitest'

import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { debtPaymentsPoints } from '~/components/wallets/analytics/cashflow'
import { balanceTooltipRows, cashflowTooltipRows, forecastTooltipRows, formatPercent, savingsRate } from '~/components/wallets/analytics/tooltips'

const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const keys = ['expense', 'income', 'interest', 'net', 'toDebts'] as const
const colors = Object.fromEntries(keys.map(key => [key, key])) as Record<typeof keys[number], string>

describe('savingsRate', () => {
  it('is undefined without income and shows a dash', () => {
    expect(savingsRate(-100, 0)).toBeUndefined()
    expect(formatPercent(savingsRate(-100, 0))).toBe('-')
    expect(formatPercent(savingsRate(2500, 10_000))).toBe('25%')
  })
})

describe('cashflowTooltipRows', () => {
  it('lists the flows of an interval in decimals with the savings rate on net', () => {
    const [rows] = cashflowTooltipRows({
      colors,
      currencyCode: 'RUB',
      labels: { ...colors, savingsRate: 'rate' },
      points: { expense: [6000_00], income: [10_000_00], interest: [500_00], net: [4000_00] },
      toDebts: [1000_00],
    })
    expect(rows!.map(row => [row.key, row.amount])).toEqual([['income', 10_000], ['expense', -6000], ['interest', -500], ['net', 4000], ['toDebts', 1000]])
    expect(rows!.find(row => row.key === 'net')!.description).toBe('rate 40%')
  })
})

describe('balanceTooltipRows', () => {
  it('shows the change from the opening point and a total when broken down', () => {
    const rows = balanceTooltipRows({
      changeLabel: 'change',
      currencyCode: 'JPY',
      series: [{ data: [150, 120], id: 'a', name: 'A', opening: 100 }, { data: [10, 30], id: 'b', name: 'B', opening: 10 }],
      total: { color: 'x', name: 'Total' },
    })
    expect(rows[0]!.map(row => [row.key, row.amount])).toEqual([['total', 160], ['a', 150], ['b', 10]])
    expect(rows[0]![0]!.description).toContain('+50')
    expect(rows[1]![1]!.description).toContain('-30')
  })
})

describe('forecastTooltipRows', () => {
  it('marks the month the money runs out', () => {
    const rows = forecastTooltipRows({
      colors: { income: '', obligations: '', regular: '', withIncome: '', withoutIncome: '' },
      currencyCode: 'JPY',
      labels: { income: 'i', obligations: 'o', regular: 'r', runOut: 'out', withIncome: 'w', withoutIncome: 'wo' },
      months: [{ endWithIncome: 50, endWithoutIncome: -10, income: 40, obligations: 0, regular: 60 }],
      runOut: { withIncome: -1, withoutIncome: 0 },
    })
    expect(rows[0]!.map(row => row.key)).toEqual(['withoutIncome', 'withIncome', 'regular', 'income'])
    expect(rows[0]![0]!.description).toBe('out')
  })
})

describe('debtPaymentsPoints', () => {
  const wallet = (type: Wallets[string]['type']) => ({ currencyCode: 'RUB', type }) as Wallets[string]
  const wallets: Wallets = { card: wallet('credit_card'), cash: wallet('cash'), loan: wallet('loan'), other: wallet('cash') }
  const trns = {
    a: { date: day('2026-01-05'), fromAmount: 300, fromWalletId: 'cash', toAmount: 300, toWalletId: 'loan', type: 'transfer' },
    b: { date: day('2026-01-06'), fromAmount: 50, fromWalletId: 'cash', toAmount: 50, toWalletId: 'other', type: 'transfer' },
    c: { date: day('2026-02-06'), fromAmount: 70, fromWalletId: 'card', toAmount: 70, toWalletId: 'loan', type: 'transfer' },
    d: { date: day('2026-02-07'), fromAmount: 20, fromWalletId: 'cash', toAmount: 20, toWalletId: 'card', type: 'transfer' },
  } as unknown as Trns

  it('sums transfers from in-scope non-credit wallets into credit products', () => {
    expect(debtPaymentsPoints({
      intervals: [{ end: day('2026-01-31'), start: day('2026-01-01') }, { end: day('2026-02-28'), start: day('2026-02-01') }],
      toBaseAt: () => amount => amount,
      trnsIds: Object.keys(trns),
      trnsItems: trns,
      walletIds: new Set(['cash', 'card', 'loan', 'other']),
      wallets,
    })).toEqual([300, 20])
  })
})
