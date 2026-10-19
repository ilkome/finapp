import { describe, expect, it } from 'vitest'

import type { PaymentRow } from '~/components/loans/engine/types'
import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'
import { balanceSeries, statisticsRowsSeries, walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'
import { cardObligations, loanObligations, projectForecast } from '~/components/wallets/analytics/forecast'
import { parseForecastSettings } from '~/components/wallets/analytics/forecastSettings'
import { detectRegular, monthlyCategorySpending, previousMonths, typicalAmount } from '~/components/wallets/analytics/regular'
import { computeShares } from '~/components/wallets/analytics/shares'

const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const wallet = (type: Wallets[string]['type'], currency = 'RUB') => ({ color: '#000', currency, desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: true, name: type, order: 0, type, updatedAt: 0 }) as Wallets[string]

const wallets: Wallets = { card: wallet('credit'), cash: wallet('cash'), usd: wallet('cashless', 'USD') }
const trns: Trns = {
  a: { amount: 100, categoryId: 'salary', date: day('2026-01-10'), type: TrnType.Income, updatedAt: 0, walletId: 'cash' },
  b: { amount: 30, categoryId: 'food', date: day('2026-02-05'), type: TrnType.Expense, updatedAt: 0, walletId: 'cash' },
  c: { categoryId: 'transfer', date: day('2026-02-06'), expenseAmount: 20, expenseWalletId: 'cash', incomeAmount: 2, incomeWalletId: 'usd', type: TrnType.Transfer, updatedAt: 0 },
  d: { amount: 50, categoryId: 'food', date: day('2026-03-01'), type: TrnType.Expense, updatedAt: 0, walletId: 'card' },
}
const ends = [day('2026-01-31'), day('2026-02-28'), day('2026-03-31')]
const toBase = (amount: number, currency: string) => currency === 'USD' ? amount * 10 : amount

describe('walletBalancesAt', () => {
  it('accumulates every wallet up to each end, transfers on both sides', () => {
    expect(walletBalancesAt(trns, wallets, ends)).toEqual([
      { cash: 100 },
      { cash: 50, usd: 2 },
      { card: -50, cash: 50, usd: 2 },
    ])
  })
})

describe('balanceSeries', () => {
  const balances = walletBalancesAt(trns, wallets, ends)
  const base = { balances, toBaseAt: () => toBase, walletIds: Object.keys(wallets), wallets }

  it('leaves debts out of the assets total and subtracts them from the net one', () => {
    expect(balanceSeries({ ...base, breakdown: 'total', scope: 'assets' })[0]!.data).toEqual([100, 70, 70])
    expect(balanceSeries({ ...base, breakdown: 'total', scope: 'net' })[0]!.data).toEqual([100, 70, 20])
  })

  it('splits by currency in base, largest last balance first', () => {
    expect(balanceSeries({ ...base, breakdown: 'currency', scope: 'assets' }).map(s => [s.id, s.data])).toEqual([
      ['RUB', [100, 50, 50]],
      ['USD', [0, 20, 20]],
    ])
  })

  it('folds the smallest wallets into other', () => {
    const series = balanceSeries({ ...base, breakdown: 'wallet', maxWallets: 2, scope: 'net' })
    // card and cash tie at 50 by size; the stable sort keeps the wallet order.
    expect(series.map(s => s.id)).toEqual(['card', 'other'])
    expect(series[1]!.data).toEqual([100, 70, 70])
  })
})

describe('statisticsRowsSeries', () => {
  it('reuses the wallets statistics rows per point', () => {
    const series = statisticsRowsSeries({
      balances: walletBalancesAt(trns, wallets, ends),
      flags: { includeArchived: false, includeExcluded: false },
      rowIds: ['total', 'credit'],
      toBaseAt: () => toBase,
      walletIds: Object.keys(wallets),
      wallets,
    })
    expect(series.map(s => s.data)).toEqual([[100, 70, 70], [0, 0, -50]])
  })
})

describe('computeShares', () => {
  const computed = { card: { ...wallets.card!, amount: -50 }, cash: { ...wallets.cash!, amount: 150 }, usd: { ...wallets.usd!, amount: 5 } }
  const params = { groupBy: 'type' as const, toBase, walletIds: Object.keys(computed), wallets: computed }

  it('measures assets and debts apart, or every balance by its size', () => {
    expect(computeShares({ ...params, mode: 'assets' }).items.map(i => [i.id, i.share])).toEqual([['cash', 0.75], ['cashless', 0.25]])
    expect(computeShares({ ...params, mode: 'debts' }).items.map(i => [i.id, i.signedValue])).toEqual([['credit', -50]])
    expect(computeShares({ ...params, mode: 'all' }).total).toBe(250)
  })
})

describe('regular spending', () => {
  const today = day('2026-04-15')
  const months = previousMonths(today, 3)
  const spending: Trns = Object.fromEntries([
    ['r1', 'rent', '2026-01-03', 500],
    ['r2', 'rent', '2026-02-03', 500],
    ['r3', 'rent', '2026-03-03', 520],
    ['t1', 'tv', '2026-03-10', 900],
    ['i1', 'loanInterest', '2026-03-10', 70],
  ].map(([id, categoryId, date, amount]) => [id, { amount, categoryId, date: day(date as string), type: TrnType.Expense, updatedAt: 0, walletId: 'cash' }]))

  const monthly = monthlyCategorySpending({ excludedCategoryIds: new Set(), months, toBase, trnsItems: spending, walletsItems: wallets })

  it('sums by category and month, loan interest left to the loan payment', () => {
    expect(months[0]!.start).toBe(day('2026-01-01'))
    expect(monthly.get('rent')).toEqual([500, 500, 520])
    expect(monthly.has('loanInterest')).toBe(false)
  })

  it('takes a category spent in enough months, overrides win', () => {
    const list = detectRegular({ amountMode: 'median', minMonths: 3, monthly, overrides: { gym: { amount: 40, state: 'include' }, tv: { state: 'include' } }, windowMonths: 3 })
    const byId = Object.fromEntries(list.map(item => [item.categoryId, item]))
    expect(byId.rent).toMatchObject({ amount: 500, isAuto: true, isRegular: true })
    expect(byId.tv).toMatchObject({ amount: 0, isAuto: false, isRegular: true })
    expect(byId.gym).toMatchObject({ amount: 40, isRegular: true, monthsWithSpending: 0 })
  })

  it('picks a typical month', () => {
    expect(typicalAmount([0, 10, 30, 20], 'median')).toBe(15)
    expect(typicalAmount([0, 10, 30, 20], 'average')).toBe(15)
    expect(typicalAmount([0, 10, 30, 20], 'max')).toBe(30)
    expect(typicalAmount([0, 10, 30, 20], 'last')).toBe(20)
  })
})

describe('obligations', () => {
  const today = day('2026-04-15')
  const row = (date: string, status: PaymentRow['status'], paid = 0) => ({ date: day(date), interestPart: 0, lastPaymentAt: null, paidAt: null, paidFine: 0, paidInterest: 0, paidPrincipal: paid, paymentNumber: 0, principalPart: 0, remainingBalance: 0, source: 'generated', status, totalAmount: 100, trnIds: [] }) as PaymentRow

  it('keeps unpaid loan rows, the left part of a partial one, overdue moved to today', () => {
    expect(loanObligations({
      rows: [row('2026-03-10', 'paid', 100), row('2026-04-10', 'partial', 40), row('2026-05-10', 'scheduled'), row('2027-05-10', 'scheduled')],
      toBase: v => v,
      today,
      until: day('2026-12-31'),
      walletId: 'loan',
    }).map(o => [o.date, o.amount])).toEqual([[today, 60], [day('2026-05-10'), 100]])
  })

  it('repeats the card minimum until the debt is covered, or pays the statement debt once', () => {
    const minPayment = { amount: 40, date: day('2026-04-20'), status: 'due' as const }
    const base = { debt: 100, grace: null, minPayment, toBase: (v: number) => v, today, until: day('2026-12-31'), walletId: 'card' }
    expect(cardObligations({ ...base, mode: 'min' }).map(o => o.amount)).toEqual([40, 40, 20])
    expect(cardObligations({ ...base, grace: { amount: 90, date: day('2026-04-25'), statementDate: null, status: 'due' }, mode: 'full' }).map(o => o.amount)).toEqual([90])
    expect(cardObligations({ ...base, minPayment: { ...minPayment, status: 'stale' }, mode: 'min' })).toEqual([])
  })
})

describe('projectForecast', () => {
  const today = day('2026-04-16')

  it('counts only what is left this month and finds the run-out day', () => {
    const result = projectForecast({
      horizonMonths: 3,
      income: 300,
      incomeThisMonth: 300,
      obligations: [{ amount: 100, date: day('2026-05-10'), kind: 'loan', walletId: 'loan' }],
      regular: [{ amount: 300, spentThisMonth: 200 }],
      startBalance: 500,
      today,
    })
    expect(result.months.map(m => [m.regular, m.income, m.obligations])).toEqual([[100, 0, 0], [300, 300, 100], [300, 300, 0]])
    expect(result.months.map(m => m.endWithoutIncome)).toEqual([400, 0, -300])
    expect(result.months.map(m => m.endWithIncome)).toEqual([400, 300, 300])
    expect(result.runwayWithIncome).toBeNull()
    expect(result.runwayWithoutIncome).toBe(day('2026-06-01'))
  })

  it('has run out already with a negative start', () => {
    expect(projectForecast({ horizonMonths: 1, income: 0, incomeThisMonth: 0, obligations: [], regular: [], startBalance: -1, today }).runwayWithoutIncome).toBe(today)
  })
})

describe('parseForecastSettings', () => {
  it('fills defaults and resets only a broken field', () => {
    expect(parseForecastSettings(null).windowMonths).toBe(6)
    const parsed = parseForecastSettings(JSON.stringify({ horizonMonths: 'x', windowMonths: 3 }))
    expect(parsed).toMatchObject({ horizonMonths: 12, windowMonths: 3 })
    expect(parseForecastSettings('{oops').cardPayment).toBe('min')
  })
})
