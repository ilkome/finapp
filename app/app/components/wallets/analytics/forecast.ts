import { sum } from 'es-toolkit'
import { addCivilDays, addCivilMonths, lastDayOfMonthCivil, startOfMonthCivil } from '~~/utils/date/civil'

import type { CategoryId } from '~/components/categories/types'
import type { PaymentRow } from '~/components/loans/engine/types'
import type { GraceLine, MinPaymentStatus } from '~/components/loans/minPayment'
import type { AmountMode, CardPaymentMode, RegularOverride } from '~/components/wallets/analytics/forecastSettings'
import type { WalletId } from '~/components/wallets/types'

import { detectRegular } from '~/components/wallets/analytics/regular'

const DAY = 86_400_000

/** A mandatory payment in base currency; an overdue one is moved to today. */
export type Obligation = {
  amount: number
  date: number
  kind: 'card' | 'loan'
  walletId: WalletId
}

/** Unpaid rows of a loan schedule up to `until`; a partly paid row keeps only what is left. */
export function loanObligations(params: {
  rows: PaymentRow[]
  toBase: (amount: number) => number
  today: number
  until: number
  walletId: WalletId
}): Obligation[] {
  const { rows, toBase, today, until, walletId } = params
  return rows
    .filter(row => row.status !== 'paid' && row.date <= until)
    .map(row => ({
      amount: Math.round(toBase(Math.max(0, row.totalAmount - row.paidPrincipal - row.paidInterest - row.paidFine))),
      date: Math.max(row.date, today),
      kind: 'loan' as const,
      walletId,
    }))
    .filter(item => item.amount > 0)
}

/**
 * Card payments up to `until`: the minimum every month until the debt is covered, or the
 * statement debt once (`full_debt`). A stale or missing summary gives nothing: there is no date to pay by.
 */
export function cardObligations(params: {
  debt: number
  grace: GraceLine | null
  minPayment: { amount: number, date: number, status: MinPaymentStatus } | null
  mode: CardPaymentMode
  toBase: (amount: number) => number
  today: number
  until: number
  walletId: WalletId
}): Obligation[] {
  const { debt, grace, minPayment, mode, toBase, today, until, walletId } = params
  const at = (amount: number, date: number): Obligation => ({ amount: Math.round(toBase(amount)), date: Math.max(date, today), kind: 'card', walletId })

  if (mode === 'full_debt') {
    if (grace?.date != null && (grace.status === 'due' || grace.status === 'overdue') && grace.amount > 0)
      return grace.date <= until ? [at(grace.amount, grace.date)] : []
    if (minPayment && (minPayment.status === 'due' || minPayment.status === 'overdue') && debt > 0)
      return minPayment.date <= until ? [at(debt, minPayment.date)] : []
    return []
  }

  if (!minPayment || minPayment.status === 'stale' || minPayment.amount <= 0)
    return []
  const result: Obligation[] = []
  // A paid minimum means the next one falls a month later.
  let date = minPayment.status === 'paid' ? addCivilMonths(minPayment.date, 1) : minPayment.date
  let left = debt
  while (left > 0 && date <= until) {
    const amount = Math.min(minPayment.amount, left)
    result.push(at(amount, date))
    left -= amount
    date = addCivilMonths(date, 1)
  }
  return result
}

/** Months with income the detection needs, as a share of the window. */
const SCHEDULE_MIN_SHARE = 0.5
/** A pay day that wanders further than this from its median is no schedule. */
const SCHEDULE_MAX_SPREAD_DAYS = 5
/** An income at least this share of its month counts as one part of the pay. */
const PART_MIN_SHARE = 0.25

export type IncomePart = {
  /** Day of the month, 1-based; a short month pays on its last day. */
  day: number
  share: number
}

const dayOfMonth = (date: number) => new Date(date).getUTCDate()
function medianOf(values: number[]) {
  const sorted = values.toSorted((a, b) => a - b)
  const middle = sorted.length >> 1
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

/**
 * Typical pay days from the income of the history window: per month the large incomes (parts of the pay), the
 * usual number of parts, then the median day and share of each part. Too few months with income, or a pay day
 * that wanders, gives null: the forecast then spreads income over the month.
 */
export function incomeSchedule(months: { amount: number, date: number }[][]): IncomePart[] | null {
  const withIncome = months.filter(entries => entries.some(entry => entry.amount > 0))
  if (!months.length || withIncome.length < Math.max(2, months.length * SCHEDULE_MIN_SHARE))
    return null
  const parts = withIncome.map((entries) => {
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
    return entries
      .filter(entry => entry.amount >= total * PART_MIN_SHARE)
      .toSorted((a, b) => a.date - b.date)
      .map(entry => ({ day: dayOfMonth(entry.date), share: entry.amount / total }))
  })
  const count = Math.round(medianOf(parts.map(list => list.length)))
  const regular = parts.filter(list => list.length === count)
  if (!count || regular.length < withIncome.length * SCHEDULE_MIN_SHARE)
    return null
  const schedule = Array.from({ length: count }, (_, index) => {
    const days = regular.map(list => list[index]!.day)
    const day = Math.round(medianOf(days))
    return { day, share: medianOf(regular.map(list => list[index]!.share)), spread: Math.max(...days.map(value => Math.abs(value - day))) }
  })
  if (schedule.some(part => part.spread > SCHEDULE_MAX_SPREAD_DAYS))
    return null
  const shareSum = schedule.reduce((sum, part) => sum + part.share, 0)
  return schedule.map(part => ({ day: part.day, share: part.share / shareSum }))
}

type ForecastMonth = {
  endWithIncome: number
  endWithoutIncome: number
  income: number
  obligations: number
  regular: number
  start: number
}

export type ForecastScenario = {
  events?: { amount: number, date: number }[]
  incomeFactor?: number
  spendingFactor?: number
}

export type WhatIfInput = {
  amount: string
  /** `YYYY-MM-DD` from a date field; empty when unset. */
  date: string
  incomePercent: string
  kind: 'expense' | 'income'
  spendingPercent: string
}

/**
 * The what-if form as a scenario; null when nothing is set.
 * A one-off needs both an amount and a date; percents change income or spending by that much.
 */
export function whatIfScenario(input: WhatIfInput, parse: (value: string) => number | undefined, toMinor: (amount: number) => number): ForecastScenario | null {
  const amount = parse(input.amount)
  const date = input.date ? Date.parse(`${input.date}T00:00:00Z`) : Number.NaN
  const factor = (value: string) => {
    const percent = parse(value)
    return percent === undefined ? undefined : 1 + percent / 100
  }
  const minor = amount && Number.isFinite(date) ? toMinor(Math.abs(amount)) : 0
  const scenario = {
    events: minor ? [{ amount: input.kind === 'income' ? minor : -minor, date }] : [],
    incomeFactor: factor(input.incomePercent),
    spendingFactor: factor(input.spendingPercent),
  }
  return scenario.events.length || scenario.incomeFactor !== undefined || scenario.spendingFactor !== undefined ? scenario : null
}

/** Why both scenarios end on the same day, when they do. */
export type ForecastCoincidence = 'arrived' | 'afterRunOut' | 'belowZero'

export type ForecastResult = {
  coincidence: ForecastCoincidence | null
  months: ForecastMonth[]
  /** Civil day of the next expected income; null without a pay-day schedule or income. */
  nextIncomeDate: number | null
  /** Civil day the money runs out in each scenario; null when it lasts past the horizon. */
  runwayWithIncome: number | null
  runwayWithoutIncome: number | null
  startBalance: number
}

/** `amount` over `days` in whole minor units, the remainder on the first days. */
function spread(amount: number, days: number): number[] {
  const base = Math.floor(amount / days)
  const rest = amount - base * days
  return Array.from({ length: days }, (_, index) => base + (index < rest ? 1 : 0))
}

/**
 * Day-by-day projection from `startBalance`: obligations on their dates, income on the pay days of `schedule`
 * (spread over the month without one), regular spending spread per day. The current month counts only what is
 * still ahead. The run-out day is the first day the balance goes below zero; a day's income lands before its outflow.
 */
export function projectForecast(params: {
  horizonMonths: number
  income: number
  incomeThisMonth: number
  obligations: Obligation[]
  regular: { amount: number, spentThisMonth: number }[]
  /** A temporary what-if: one-off moves (income positive) and factors on regular spending and income. */
  scenario?: ForecastScenario
  schedule?: IncomePart[] | null
  startBalance: number
  today: number
}): ForecastResult {
  const { horizonMonths, incomeThisMonth, obligations, regular, schedule, startBalance, today } = params
  const { events = [], incomeFactor = 1, spendingFactor = 1 } = params.scenario ?? {}
  const income = params.income * incomeFactor
  const regularMonthly = Math.round(regular.reduce((sum, item) => sum + item.amount, 0) * spendingFactor)
  const regularLeftNow = Math.round(regular.reduce((sum, item) => sum + Math.max(0, item.amount * spendingFactor - item.spentThisMonth), 0))
  const firstMonth = startOfMonthCivil(today)

  const months: ForecastMonth[] = []
  let withIncome = startBalance
  let withoutIncome = startBalance
  let runwayWithIncome: number | null = startBalance < 0 ? today : null
  let runwayWithoutIncome: number | null = startBalance < 0 ? today : null
  let nextIncomeDate: number | null = null

  for (let index = 0; index < horizonMonths; index++) {
    const start = addCivilMonths(firstMonth, index)
    const end = lastDayOfMonthCivil(start)
    const from = index === 0 ? today : start
    const days = Math.round((end - from) / DAY) + 1
    const monthDays = Math.round((end - start) / DAY) + 1

    const outflow = Array.from<number>({ length: days }).fill(0)
    let monthObligations = 0
    for (const item of obligations) {
      if (item.date >= from && item.date <= end) {
        outflow[Math.round((item.date - from) / DAY)]! += item.amount
        monthObligations += item.amount
      }
    }
    // A one-off move counts in both scenarios: it is planned, not income the scenario leaves out.
    for (const event of events) {
      if (event.date >= from && event.date <= end)
        outflow[Math.round((event.date - from) / DAY)]! -= event.amount
    }
    const monthRegular = index === 0 ? regularLeftNow : regularMonthly
    spread(monthRegular, days).forEach((amount, day) => outflow[day]! += amount)

    const monthIncome = Math.round(index === 0 ? Math.max(0, income - incomeThisMonth) : income)
    const inflow = Array.from<number>({ length: days }).fill(0)
    if (schedule?.length) {
      // Each part on its day; this month's parts already paid are what `incomeThisMonth` covers.
      let left = monthIncome
      for (const part of schedule) {
        const day = Math.min(part.day, monthDays) - 1 - (monthDays - days)
        if (day < 0 || left <= 0)
          continue
        const amount = part === schedule.at(-1) ? left : Math.min(left, Math.round(income * part.share))
        inflow[day]! += amount
        left -= amount
      }
    }
    else {
      spread(monthIncome, days).forEach((amount, day) => inflow[day]! += amount)
    }

    for (let day = 0; day < days; day++) {
      const date = addCivilDays(from, day)
      if (inflow[day]! > 0 && schedule?.length && nextIncomeDate === null && date > today)
        nextIncomeDate = date
      withIncome += inflow[day]! - outflow[day]!
      withoutIncome -= outflow[day]!
      if (runwayWithIncome === null && withIncome < 0)
        runwayWithIncome = date
      if (runwayWithoutIncome === null && withoutIncome < 0)
        runwayWithoutIncome = date
    }

    months.push({ endWithIncome: withIncome, endWithoutIncome: withoutIncome, income: monthIncome, obligations: monthObligations, regular: monthRegular, start })
  }

  let coincidence: ForecastCoincidence | null = null
  if (runwayWithIncome !== null && runwayWithIncome === runwayWithoutIncome) {
    coincidence = startBalance < 0
      ? 'belowZero'
      : income > 0 && incomeThisMonth >= income && runwayWithIncome <= lastDayOfMonthCivil(today)
        ? 'arrived'
        : 'afterRunOut'
  }

  return { coincidence, months, nextIncomeDate, runwayWithIncome, runwayWithoutIncome, startBalance }
}

/**
 * Months of cover at each point: the start-wallet balance there over the monthly outflow known at that time, so a
 * past month is not judged by today's spending. The outflow is the regular spending detected over the history
 * window ending at the point plus the debt payments actually made in that window, per month.
 * `spending` and `debtPayments` run over one contiguous list of months; `windowEnds` index into it (inclusive).
 */
export function coverTrend(params: {
  amountMode: AmountMode
  balances: number[]
  debtPayments: number[]
  minMonths: number
  overrides: Record<CategoryId, RegularOverride>
  spending: Map<CategoryId, number[]>
  windowEnds: number[]
  windowMonths: number
}): (number | null)[] {
  const { amountMode, balances, debtPayments, minMonths, overrides, spending, windowEnds, windowMonths } = params
  return windowEnds.map((end, index) => {
    const start = Math.max(0, end - windowMonths + 1)
    const monthly = new Map([...spending].map(([categoryId, data]) => [categoryId, data.slice(start, end + 1)] as const))
    const regular = detectRegular({ amountMode, minMonths, monthly, overrides, windowMonths })
      .filter(item => item.isRegular)
      .reduce((sum, item) => sum + item.amount, 0)
    const debt = sum(debtPayments.slice(start, end + 1)) / windowMonths
    const outflow = regular + debt
    return outflow > 0 ? balances[index]! / outflow : null
  })
}

/** Days ahead the upcoming-payments summary sums over. */
export const UPCOMING_DAYS = 30

/** The next mandatory payment and the total due within `days` from today. */
export function upcomingPayments(obligations: Obligation[], today: number, days = UPCOMING_DAYS) {
  const until = addCivilDays(today, days)
  const due = obligations.filter(item => item.date >= today && item.date <= until)
  const next = obligations.filter(item => item.date >= today).toSorted((a, b) => a.date - b.date)[0] ?? null
  return { next, total: due.reduce((sum, item) => sum + item.amount, 0) }
}
