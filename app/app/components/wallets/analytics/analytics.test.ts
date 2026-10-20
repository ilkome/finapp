import { describe, expect, it } from 'vitest'

import type { PaymentRow } from '~/components/loans/engine/types'
import type { Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { balanceExtremes, balanceSeries, changeDecomposition, changeSeries, periodChange, splitOpening, statisticsRowsSeries, walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'
import { cardObligations, coverTrend, incomeSchedule, loanObligations, projectForecast } from '~/components/wallets/analytics/forecast'
import { parseForecastCategories, parseForecastSettings, toRegularOverride } from '~/components/wallets/analytics/forecastSettings'
import { currentMonth, detectRegular, monthlySums, previousMonths, sliceMonthlySums, typicalAmount } from '~/components/wallets/analytics/regular'
import { computeShares } from '~/components/wallets/analytics/shares'

const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const wallet = (type: Wallets[string]['type'], currency = 'RUB') => ({ color: '#000', createdAt: 0, currencyCode: currency, description: '', isArchived: false, isExcludedFromTotal: false, isWithdrawable: true, name: type, sortOrder: 0, type, updatedAt: 0 }) as Wallets[string]

const wallets: Wallets = { card: wallet('credit_card'), cash: wallet('cash'), usd: wallet('bank_account', 'USD') }
const trns: Trns = {
  a: { categoryId: 'salary', createdAt: 0, date: day('2026-01-10'), toAmount: 100, toWalletId: 'cash', type: 'income', updatedAt: 0 },
  b: { categoryId: 'food', createdAt: 0, date: day('2026-02-05'), fromAmount: 30, fromWalletId: 'cash', type: 'expense', updatedAt: 0 },
  c: { createdAt: 0, date: day('2026-02-06'), fromAmount: 20, fromWalletId: 'cash', toAmount: 2, toWalletId: 'usd', type: 'transfer', updatedAt: 0 },
  d: { categoryId: 'food', createdAt: 0, date: day('2026-03-01'), fromAmount: 50, fromWalletId: 'card', type: 'expense', updatedAt: 0 },
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

  it('counts a move inside the first interval in the period change', () => {
    // Range starts in January: the opening point is the day before it, so the January income is part of the change.
    const points = walletBalancesAt(trns, wallets, [day('2026-01-01') - 1, ...ends])
    const [series] = splitOpening(balanceSeries({ balances: points, breakdown: 'total', scope: 'net', toBaseAt: () => toBase, walletIds: ['cash'], wallets }))
    expect(series!.data).toHaveLength(ends.length)
    expect(periodChange(series!)).toBe(50)
  })
})

describe('balanceExtremes', () => {
  const params = { toBaseOn: () => toBase, trnsItems: trns, walletIds: ['cash', 'usd'], wallets }

  it('finds the daily low between two interval ends', () => {
    // Feb 1: 100, Feb 4: 60, Feb 5: 30 (low), Feb 6: a transfer keeps 30, Feb 20: 60. The month end alone reads 60.
    const extra: Trns = { ...trns, e: { categoryId: 'salary', createdAt: 0, date: day('2026-02-20'), toAmount: 30, toWalletId: 'cash', type: 'income', updatedAt: 0 }, f: { categoryId: 'food', createdAt: 0, date: day('2026-02-04'), fromAmount: 40, fromWalletId: 'cash', type: 'expense', updatedAt: 0 } }
    const result = balanceExtremes({ ...params, rangeEnd: day('2026-02-28'), rangeStart: day('2026-02-01'), trnsItems: extra })
    expect(result.min).toEqual({ date: day('2026-02-05'), value: 30 })
    expect(result.max).toEqual({ date: day('2026-02-01'), value: 100 })
  })

  it('takes the all-time high from before the range', () => {
    const result = balanceExtremes({ ...params, rangeEnd: day('2026-03-31'), rangeStart: day('2026-03-01') })
    expect(result.ath).toEqual({ date: day('2026-01-10'), value: 100 })
    expect(result.max).toEqual({ date: day('2026-03-01'), value: 70 })
  })
})

describe('changeDecomposition', () => {
  it('splits the change into flows, revaluation and other, adding up to it', () => {
    // USD worth 10 at the opening, 10 after January, 12 after February, 15 after March.
    const rates = [10, 10, 12, 15]
    const toBaseAtPoint = (index: number) => (amount: number, currency: string) => currency === 'USD' ? amount * rates[index]! : amount
    const extra: Trns = { ...trns, e: { createdAt: 0, date: day('2026-03-02'), fromAmount: 5, fromWalletId: 'cash', type: 'adjustment', updatedAt: 0 } }
    const result = changeDecomposition({
      excludedCategoryIds: new Set(),
      intervals: ends.map((end, index) => ({ end, start: index ? ends[index - 1]! + 1 : day('2026-01-01') })),
      pointBalances: walletBalancesAt(extra, wallets, [day('2026-01-01') - 1, ...ends]),
      toBaseAtPoint,
      trnsIds: Object.keys(extra),
      trnsItems: extra,
      walletIds: ['cash', 'usd'],
      wallets,
    })
    // Flows: +100 salary, -30 food. Other: the transfer -20 + 2 USD at 12 = +4, the adjustment -5. USD 2 held from 12 to 15: +6.
    expect(result).toEqual({ change: 75, flows: 70, other: -1, revaluation: 6 })
    expect(result.flows + result.other + result.revaluation).toBe(result.change)
  })
})

describe('changeSeries', () => {
  it('measures the first change from the opening value', () => {
    expect(changeSeries([{ data: [120, 90], id: 'a', opening: 100 }])[0]!.data).toEqual([20, -30])
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
      rowIds: ['total', 'credit_card'],
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
    expect(computeShares({ ...params, mode: 'assets' }).items.map(i => [i.id, i.share])).toEqual([['cash', 0.75], ['bank_account', 0.25]])
    expect(computeShares({ ...params, mode: 'debts' }).items.map(i => [i.id, i.signedValue])).toEqual([['credit_card', -50]])
    expect(computeShares({ ...params, mode: 'gross' }).total).toBe(250)
  })

  it('reads a mixed-sign group in every mode', () => {
    const mixed = { card: { ...wallets.card!, amount: -80_000 }, cash: { ...wallets.cash!, amount: 100_000 } }
    const run = (mode: 'gross' | 'net' | 'split') => computeShares({ groupBy: 'currency', mode, toBase, walletIds: ['cash', 'card'], wallets: mixed })
    expect(run('gross').items.map(i => i.value)).toEqual([180_000])
    expect(run('net').items.map(i => [i.value, i.signedValue])).toEqual([[20_000, 20_000]])
    expect(run('split').items.map(i => [i.id, i.value])).toEqual([['RUB:assets', 100_000], ['RUB:debts', 80_000]])
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
    ['i1', 'loan_interest', '2026-03-10', 70],
    ['n1', 'food', '2026-04-02', 30],
  ].map(([id, categoryId, date, amount]) => [id, { categoryId, createdAt: 0, date: day(date as string), fromAmount: amount, fromWalletId: 'cash', type: 'expense', updatedAt: 0 }]))
  spending.s1 = { categoryId: 'salary', createdAt: 0, date: day('2026-02-05'), toAmount: 3000, toWalletId: 'cash', type: 'income', updatedAt: 0 } as Trns[string]

  const all = monthlySums({ excludedCategoryIds: new Set(), months: [...months, currentMonth(today)], toBase, trnsItems: spending, walletsItems: wallets })
  const monthly = sliceMonthlySums(all, 0, -1).spending

  it('sums by category and month, loan interest left to the loan payment', () => {
    expect(months[0]!.start).toBe(day('2026-01-01'))
    expect(monthly.get('rent')).toEqual([500, 500, 520])
    expect(monthly.has('loan_interest')).toBe(false)
  })

  it('splits one pass into the window and the current month, income included', () => {
    expect(monthly.has('food')).toBe(false)
    expect(sliceMonthlySums(all, -1)).toEqual({ income: [0], incomeEntries: [[]], spending: new Map([['food', [30]]]) })
    expect(sliceMonthlySums(all, 0, -1).income).toEqual([0, 3000, 0])
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
    expect(cardObligations({ ...base, mode: 'minimum' }).map(o => o.amount)).toEqual([40, 40, 20])
    expect(cardObligations({ ...base, grace: { amount: 90, date: day('2026-04-25'), statementDate: null, status: 'due' }, mode: 'full_debt' }).map(o => o.amount)).toEqual([90])
    expect(cardObligations({ ...base, minPayment: { ...minPayment, status: 'stale' }, mode: 'minimum' })).toEqual([])
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

  it('runs out before a pay day after an obligation, not by the month average', () => {
    // Loan 400 on May 5, salary 1000 on May 10, start 300: short on May 5 with or without income.
    const result = projectForecast({
      horizonMonths: 2,
      income: 1000,
      incomeThisMonth: 1000,
      obligations: [{ amount: 400, date: day('2026-05-05'), kind: 'loan', walletId: 'loan' }],
      regular: [],
      schedule: [{ day: 10, share: 1 }],
      startBalance: 300,
      today,
    })
    expect(result.runwayWithoutIncome).toBe(day('2026-05-05'))
    expect(result.runwayWithIncome).toBe(day('2026-05-05'))
    expect(result.coincidence).toBe('afterRunOut')
    expect(result.nextIncomeDate).toBe(day('2026-05-10'))
    expect(result.months[1]!.endWithIncome).toBe(900)
  })

  it('returns the base result for an empty what-if, and moves the run-out for a one-off expense', () => {
    const params = { horizonMonths: 3, income: 300, incomeThisMonth: 0, obligations: [], regular: [{ amount: 300, spentThisMonth: 0 }], startBalance: 500, today }
    const base = projectForecast(params)
    expect(projectForecast({ ...params, scenario: {} })).toEqual(base)
    const spent = projectForecast({ ...params, scenario: { events: [{ amount: -400, date: day('2026-04-20') }] } })
    expect(spent.runwayWithoutIncome!).toBeLessThan(base.runwayWithoutIncome!)
    expect(projectForecast({ ...params, scenario: { spendingFactor: 0.5 } }).months[1]!.regular).toBe(150)
  })

  it('has run out already with a negative start', () => {
    expect(projectForecast({ horizonMonths: 1, income: 0, incomeThisMonth: 0, obligations: [], regular: [], startBalance: -1, today }).runwayWithoutIncome).toBe(today)
  })
})

describe('coverTrend', () => {
  const base = { amountMode: 'median' as const, minMonths: 2, overrides: {}, windowMonths: 3 }

  it('is not moved by a one-off expense, the median keeps the outflow', () => {
    const covers = coverTrend({ ...base, balances: [3000, 3000], debtPayments: [0, 0, 0, 0], spending: new Map([['food', [100, 100, 100, 5000]]]), windowEnds: [2, 3] })
    expect(covers).toEqual([30, 30])
  })

  it('rises once a loan is paid off', () => {
    const covers = coverTrend({ ...base, balances: [1200, 1200], debtPayments: [300, 300, 300, 0, 0, 0], spending: new Map([['food', [100, 100, 100, 100, 100, 100]]]), windowEnds: [2, 5] })
    expect(covers).toEqual([3, 12])
  })
})

describe('incomeSchedule', () => {
  const month = (...entries: [string, number][]) => entries.map(([iso, amount]) => ({ amount, date: day(iso) }))

  it('finds a single pay day', () => {
    expect(incomeSchedule([month(['2026-01-10', 1000]), month(['2026-02-11', 1000], ['2026-02-20', 50]), month(['2026-03-09', 1000])])).toEqual([{ day: 10, share: 1 }])
  })

  it('finds a pay that comes in two parts', () => {
    const schedule = incomeSchedule([month(['2026-01-05', 400], ['2026-01-20', 600]), month(['2026-02-05', 400], ['2026-02-20', 600]), month(['2026-03-06', 400], ['2026-03-21', 600])])
    expect(schedule!.map(part => part.day)).toEqual([5, 20])
    expect(schedule![0]!.share).toBeCloseTo(0.4)
  })

  it('gives no schedule for irregular income, so the forecast spreads it', () => {
    expect(incomeSchedule([month(['2026-01-02', 1000]), month(['2026-02-25', 1000]), month(['2026-03-14', 1000])])).toBeNull()
  })
})

describe('forecast settings', () => {
  it('fills defaults and resets only a broken field', () => {
    expect(parseForecastSettings(null)).toEqual({ cardPaymentMode: 'minimum', historyMonths: 6, horizonMonths: 12, isByParentCategory: false, regularAmountMode: 'median', regularMinMonths: 5 })
    expect(parseForecastSettings({ cardPaymentMode: 'min', historyMonths: 3, horizonMonths: 'x' })).toMatchObject({ cardPaymentMode: 'minimum', historyMonths: 3, horizonMonths: 12 })
  })

  it('reads category rows and turns them into overrides in base currency', () => {
    const categories = parseForecastCategories([{ categoryId: 'rent', currencyCode: 'USD', monthlyAmount: 40 }, { categoryId: 'tv', isIncluded: false }, { isIncluded: true }])
    expect(Object.keys(categories)).toEqual(['rent', 'tv'])
    expect(toRegularOverride(categories.rent!, toBase, 'RUB')).toEqual({ amount: 400 })
    expect(toRegularOverride(categories.tv!, toBase, 'RUB')).toEqual({ state: 'exclude' })
    expect(toRegularOverride({ categoryId: 'x' }, toBase, 'RUB')).toBeUndefined()
  })

  it('keeps detection for an amount-only override', () => {
    const list = detectRegular({ amountMode: 'median', minMonths: 2, monthly: new Map([['rent', [10, 10]]]), overrides: { rent: { amount: 99 } }, windowMonths: 2 })
    expect(list[0]).toMatchObject({ amount: 99, isRegular: true })
  })
})
