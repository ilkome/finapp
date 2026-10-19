import { addCivilDays, addCivilMonths, lastDayOfMonthCivil, startOfMonthCivil } from '~~/utils/date/civil'

import type { PaymentRow } from '~/components/loans/engine/types'
import type { GraceLine, MinPaymentStatus } from '~/components/loans/minPayment'
import type { WalletId } from '~/components/wallets/types'

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
      amount: toBase(Math.max(0, row.totalAmount - row.paidPrincipal - row.paidInterest - row.paidFine)),
      date: Math.max(row.date, today),
      kind: 'loan' as const,
      walletId,
    }))
    .filter(item => item.amount > 0)
}

/**
 * Card payments up to `until`: the minimum every month until the debt is covered, or (`full`) the
 * statement debt once. A stale or missing summary gives nothing: there is no date to pay by.
 */
export function cardObligations(params: {
  debt: number
  grace: GraceLine | null
  minPayment: { amount: number, date: number, status: MinPaymentStatus } | null
  mode: 'full' | 'min'
  toBase: (amount: number) => number
  today: number
  until: number
  walletId: WalletId
}): Obligation[] {
  const { debt, grace, minPayment, mode, toBase, today, until, walletId } = params
  const at = (amount: number, date: number): Obligation => ({ amount: toBase(amount), date: Math.max(date, today), kind: 'card', walletId })

  if (mode === 'full') {
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

type ForecastMonth = {
  endWithIncome: number
  endWithoutIncome: number
  income: number
  obligations: number
  regular: number
  start: number
}

export type ForecastResult = {
  months: ForecastMonth[]
  /** Civil day the money runs out in each scenario; null when it lasts past the horizon. */
  runwayWithIncome: number | null
  runwayWithoutIncome: number | null
  startBalance: number
}

/**
 * Month-by-month projection from `startBalance`. The current month counts only what is still
 * ahead: regular spending and income less what already happened, obligations from today on.
 */
export function projectForecast(params: {
  horizonMonths: number
  income: number
  incomeThisMonth: number
  obligations: Obligation[]
  regular: { amount: number, spentThisMonth: number }[]
  startBalance: number
  today: number
}): ForecastResult {
  const { horizonMonths, income, incomeThisMonth, obligations, regular, startBalance, today } = params
  const regularMonthly = regular.reduce((sum, item) => sum + item.amount, 0)
  const regularLeftNow = regular.reduce((sum, item) => sum + Math.max(0, item.amount - item.spentThisMonth), 0)
  const firstMonth = startOfMonthCivil(today)

  const months: ForecastMonth[] = []
  let withIncome = startBalance
  let withoutIncome = startBalance
  let runwayWithIncome: number | null = startBalance < 0 ? today : null
  let runwayWithoutIncome: number | null = startBalance < 0 ? today : null

  for (let index = 0; index < horizonMonths; index++) {
    const start = addCivilMonths(firstMonth, index)
    const end = lastDayOfMonthCivil(start)
    const from = index === 0 ? today : start
    const monthObligations = obligations
      .filter(item => item.date >= start && item.date <= end)
      .reduce((sum, item) => sum + item.amount, 0)
    const monthRegular = index === 0 ? regularLeftNow : regularMonthly
    const monthIncome = index === 0 ? Math.max(0, income - incomeThisMonth) : income
    const outflow = monthObligations + monthRegular

    const nextWithIncome = withIncome - outflow + monthIncome
    const nextWithoutIncome = withoutIncome - outflow
    runwayWithIncome ??= runOutDay(withIncome, nextWithIncome, from, end)
    runwayWithoutIncome ??= runOutDay(withoutIncome, nextWithoutIncome, from, end)
    withIncome = nextWithIncome
    withoutIncome = nextWithoutIncome

    months.push({ endWithIncome: withIncome, endWithoutIncome: withoutIncome, income: monthIncome, obligations: monthObligations, regular: monthRegular, start })
  }

  return { months, runwayWithIncome, runwayWithoutIncome, startBalance }
}

/** Day inside [from, end] the balance crosses zero, spending spread evenly over the days. */
function runOutDay(before: number, after: number, from: number, end: number): number | null {
  if (before < 0 || after >= 0)
    return null
  const days = Math.round((end - from) / DAY) + 1
  return addCivilDays(from, Math.min(days - 1, Math.floor(before / (before - after) * days)))
}
