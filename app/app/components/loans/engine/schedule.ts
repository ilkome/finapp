import { differenceInCalendarDays, getDaysInYear } from 'date-fns'
import { roundTo } from '~~/utils/amount/round'
import { addCivilMonths, epochToCivilParts, lastDayOfMonthCivil, toCivilDayEpoch, u } from '~~/utils/date/civil'

import type { LoanParams, ScheduleOverride, ScheduleRow } from '~/components/loans/engine/types'

/** Round money of this loan to its currency's minor unit. */
export function roundMoney(params: Pick<LoanParams, 'precision'>, value: number): number {
  return roundTo(value, params.precision)
}

function monthlyRate(params: LoanParams): number {
  return params.annualRate / 100 / 12
}

/** Actual/actual: each day counts against the length of its own year, so a leap year divides by 366. */
function yearFraction(from: number, to: number): number {
  let fraction = 0
  let start = from
  while (start < to) {
    const year = new Date(start).getUTCFullYear()
    const end = Math.min(to, Date.UTC(year + 1, 0, 1))
    fraction += differenceInCalendarDays(u(end), u(start)) / getDaysInYear(u(start))
    start = end
  }
  return fraction
}

function isRegularFirstPeriod(params: LoanParams): boolean {
  return params.firstPaymentDate === addCivilMonths(params.startDate, 1)
}

/**
 * Interest of payment `n` on `balance`. `daily` accrues actual/actual over the days since the previous
 * payment, the way most banks do. `monthly` charges `rate / 12`, except a first period that is not
 * exactly a month from the start: that one accrues daily too, so a few days never cost a month.
 * `period` passes the row dates when the caller has them: an override moves its own date, and the
 * date math is the hot path of every rebuilt tail.
 */
export function periodInterest(params: LoanParams, n: number, balance: number, period?: { from?: number, to: number }): number {
  if (params.interestMethod === 'daily' || (n === 1 && !isRegularFirstPeriod(params))) {
    const from = period?.from ?? (n === 1 ? params.startDate : paymentDate(params, n - 1))
    const to = period?.to ?? paymentDate(params, n)
    return roundMoney(params, balance * params.annualRate / 100 * yearFraction(from, to))
  }
  return roundMoney(params, balance * monthlyRate(params))
}

/** Payment `n` (1-based): the contracted first date, then `paymentDay` of each following month. */
function paymentDate(params: LoanParams, n: number): number {
  if (n <= 1)
    return params.firstPaymentDate

  const inMonth = addCivilMonths(params.firstPaymentDate, n - 1)
  const { day: lastDay, month, year } = epochToCivilParts(lastDayOfMonthCivil(inMonth))
  return toCivilDayEpoch(year, month, Math.min(params.paymentDay, lastDay))
}

/** Annuity payment: `balance * i / (1 - (1 + i)^-n)`. */
function annuityPayment(balance: number, rate: number, count: number, precision = 2): number {
  if (count <= 0)
    return 0
  if (rate === 0)
    return roundTo(balance / count, precision)

  return roundTo((balance * rate) / (1 - (1 + rate) ** -count), precision)
}

/** A reconciled row that money already landed on; plain schedule rows have none. */
function hasPayments(row: ScheduleRow): boolean {
  return 'trnIds' in row && (row.trnIds as string[]).length > 0
}

export function isHoliday(row: { principalPart: number, totalAmount: number }): boolean {
  return row.totalAmount <= 0 && row.principalPart <= 0
}

/**
 * The plan: every payment number up to the term, stored overrides in their place. A holiday row
 * pays nothing, so each one slides the term one month further out. The generated rows are then
 * solved together with the overrides around them, see `fillTail`.
 */
export function generateSchedule(params: LoanParams, overrides: ScheduleOverride[] = []): ScheduleRow[] {
  const byNumber = new Map(overrides.map(override => [override.paymentNumber, override]))
  const holidays = overrides.filter(isHoliday).length
  const total = Math.max(params.termMonths, ...overrides.map(override => override.paymentNumber)) + holidays

  const skeleton: ScheduleRow[] = []
  for (let n = 1; n <= total; n++) {
    const override = byNumber.get(n)
    skeleton.push(override
      ? { ...override, paymentNumber: n, remainingBalance: 0 }
      : { date: paymentDate(params, n), interestPart: 0, paymentNumber: n, principalPart: 0, remainingBalance: 0, source: 'generated', totalAmount: 0 })
  }

  return fillTail(params, skeleton, params.principalAmount, true)
}

/** Debt left after `tail` when every generated row pays `payment` and every bank row its own principal. */
function balanceAfter(params: LoanParams, tail: ScheduleRow[], startBalance: number, payment: number, prevDate?: number): number {
  let balance = startBalance
  let from = prevDate
  for (const row of tail) {
    balance -= row.source === 'generated' ? payment - periodInterest(params, row.paymentNumber, balance, { from, to: row.date }) : row.principalPart
    from = row.date
  }
  return balance
}

/**
 * The annuity payment that clears `startBalance` over the whole tail. The end balance is linear in
 * the payment, so two probes solve it whatever the tail holds: bank rows repaying their own
 * principal, holidays, a short first period, daily interest. The plain formula stays for the
 * regular case, where it is exact to the kopeck.
 */
function solvePayment(params: LoanParams, tail: ScheduleRow[], startBalance: number, prevDate?: number): number {
  const count = tail.filter(row => row.source === 'generated').length
  const guess = annuityPayment(startBalance, monthlyRate(params), count, params.precision)
  const isRegular = count === tail.length && params.interestMethod !== 'daily'
    && (tail[0]?.paymentNumber !== 1 || isRegularFirstPeriod(params))
  if (count === 0 || isRegular)
    return guess

  const probe = guess > 0 ? guess : startBalance
  const atZero = balanceAfter(params, tail, startBalance, 0, prevDate)
  const atProbe = balanceAfter(params, tail, startBalance, probe, prevDate)
  const slope = (atZero - atProbe) / probe
  return slope > 0 ? roundMoney(params, Math.max(atZero / slope, 0)) : guess
}

/**
 * Recalculate the generated rows of a tail from `startBalance`.
 * `reducePayment` re-solves the payment over the same number of rows, `reduceTerm` keeps the
 * payment and simply runs out of balance earlier, which drops the rows that are no longer needed.
 * Bank and manual rows are never recalculated, only re-chained onto the running balance.
 */
export function rebuildTail<T extends ScheduleRow>(params: LoanParams, tail: T[], startBalance: number, prevDate?: number): T[] {
  const first = tail.find(row => row.source === 'generated')
  return fillTail(params, tail, startBalance, params.overpaymentMode === 'reducePayment' || !first, prevDate)
}

/** Fill the generated rows of `tail` from `startBalance`: solved afresh, or keeping the first one's payment. */
function fillTail<T extends ScheduleRow>(params: LoanParams, tail: T[], startBalance: number, solve: boolean, prevDate?: number): T[] {
  if (startBalance <= 0)
    return tail.filter(hasPayments)

  const generated = tail.filter(row => row.source === 'generated')
  const lastGenerated = generated.at(-1)
  const first = generated[0]
  // Bank rows in the tail repay their own principal, so the generated rows only carry the rest.
  const bankPrincipal = tail.reduce((total, row) => row.source === 'generated' ? total : total + row.principalPart, 0)
  const payment = solve || !first ? solvePayment(params, tail, startBalance, prevDate) : first.totalAmount
  const fixedPrincipal = solve || !first ? roundMoney(params, Math.max(startBalance - bankPrincipal, 0) / Math.max(generated.length, 1)) : first.principalPart

  let balance = startBalance
  const out: T[] = []
  // Previous row's date; without `prevDate` the first row of the tail falls back to the contract dates.
  let from = prevDate

  for (const row of tail) {
    const period = { from, to: row.date }
    from = row.date
    // Paid off: a later override (bank plan, holiday) is stale and would push the end date out.
    if (balance <= 0 && !hasPayments(row))
      continue

    if (row.source !== 'generated') {
      balance = roundMoney(params, balance - row.principalPart)
      out.push({ ...row, remainingBalance: balance })
      continue
    }

    const interest = periodInterest(params, row.paymentNumber, balance, period)
    let principal = params.scheduleType === 'annuity' ? roundMoney(params, payment - interest) : fixedPrincipal
    const clears = row === lastGenerated || principal >= balance
    if (clears)
      principal = balance

    const totalAmount = clears || params.scheduleType === 'differentiated'
      ? roundMoney(params, principal + interest)
      : payment

    balance = roundMoney(params, balance - principal)
    out.push({ ...row, interestPart: interest, principalPart: principal, remainingBalance: balance, totalAmount })
  }

  return out
}
