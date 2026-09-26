import { addCivilMonths, epochToCivilParts, lastDayOfMonthCivil, toCivilDayEpoch } from '~~/utils/date/civil'

import type { LoanParams, ScheduleOverride, ScheduleRow } from '~/components/loans/engine/types'

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function monthlyRate(params: LoanParams): number {
  return params.annualRate / 100 / 12
}

const DAY_MS = 86_400_000

function isRegularFirstPeriod(params: LoanParams): boolean {
  return params.firstPaymentDate === addCivilMonths(params.startDate, 1)
}

/**
 * Interest of payment `n` on `balance`. `daily` accrues actual/365 over the days since the previous
 * payment, the way most banks do. `monthly` charges `rate / 12`, except a first period that is not
 * exactly a month from the start: that one accrues daily too, so 5 days never cost a month.
 */
export function periodInterest(params: LoanParams, n: number, balance: number): number {
  if (params.interestMethod === 'daily' || (n === 1 && !isRegularFirstPeriod(params))) {
    const from = n === 1 ? params.startDate : paymentDate(params, n - 1)
    const days = Math.max(Math.round((paymentDate(params, n) - from) / DAY_MS), 0)
    return round2(balance * params.annualRate / 100 * days / 365)
  }
  return round2(balance * monthlyRate(params))
}

/** Payment `n` (1-based): the contracted first date, then `paymentDay` of each following month. */
export function paymentDate(params: LoanParams, n: number): number {
  if (n <= 1)
    return params.firstPaymentDate

  const inMonth = addCivilMonths(params.firstPaymentDate, n - 1)
  const { day: lastDay, month, year } = epochToCivilParts(lastDayOfMonthCivil(inMonth))
  return toCivilDayEpoch(year, month, Math.min(params.paymentDay, lastDay))
}

/** Annuity payment: `balance * i / (1 - (1 + i)^-n)`. */
export function annuityPayment(balance: number, rate: number, count: number): number {
  if (count <= 0)
    return 0
  if (rate === 0)
    return round2(balance / count)

  return round2((balance * rate) / (1 - (1 + rate) ** -count))
}

function isHoliday(row: { principalPart: number, totalAmount: number }): boolean {
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
function balanceAfter(params: LoanParams, tail: ScheduleRow[], startBalance: number, payment: number): number {
  let balance = startBalance
  for (const row of tail)
    balance -= row.source === 'generated' ? payment - periodInterest(params, row.paymentNumber, balance) : row.principalPart
  return balance
}

/**
 * The annuity payment that clears `startBalance` over the whole tail. The end balance is linear in
 * the payment, so two probes solve it whatever the tail holds: bank rows repaying their own
 * principal, holidays, a short first period, daily interest. The plain formula stays for the
 * regular case, where it is exact to the kopeck.
 */
function solvePayment(params: LoanParams, tail: ScheduleRow[], startBalance: number): number {
  const count = tail.filter(row => row.source === 'generated').length
  const guess = annuityPayment(startBalance, monthlyRate(params), count)
  const isRegular = count === tail.length && params.interestMethod !== 'daily'
    && (tail[0]?.paymentNumber !== 1 || isRegularFirstPeriod(params))
  if (count === 0 || isRegular)
    return guess

  const probe = guess > 0 ? guess : startBalance
  const atZero = balanceAfter(params, tail, startBalance, 0)
  const atProbe = balanceAfter(params, tail, startBalance, probe)
  const slope = (atZero - atProbe) / probe
  return slope > 0 ? round2(Math.max(atZero / slope, 0)) : guess
}

/**
 * Recalculate the generated rows of a tail from `startBalance`.
 * `reducePayment` re-solves the payment over the same number of rows, `reduceTerm` keeps the
 * payment and simply runs out of balance earlier, which drops the rows that are no longer needed.
 * Bank and manual rows are never recalculated, only re-chained onto the running balance.
 */
export function rebuildTail<T extends ScheduleRow>(params: LoanParams, tail: T[], startBalance: number): T[] {
  const first = tail.find(row => row.source === 'generated')
  return fillTail(params, tail, startBalance, params.overpaymentMode === 'reducePayment' || !first)
}

/** Fill the generated rows of `tail` from `startBalance`: solved afresh, or keeping the first one's payment. */
function fillTail<T extends ScheduleRow>(params: LoanParams, tail: T[], startBalance: number, solve: boolean): T[] {
  if (startBalance <= 0)
    return tail.filter(row => row.source !== 'generated')

  const generated = tail.filter(row => row.source === 'generated')
  const lastGenerated = generated.at(-1)
  const first = generated[0]
  // Bank rows in the tail repay their own principal, so the generated rows only carry the rest.
  const bankPrincipal = tail.reduce((total, row) => row.source === 'generated' ? total : total + row.principalPart, 0)
  const payment = solve || !first ? solvePayment(params, tail, startBalance) : first.totalAmount
  const fixedPrincipal = solve || !first ? round2(Math.max(startBalance - bankPrincipal, 0) / Math.max(generated.length, 1)) : first.principalPart

  let balance = startBalance
  const out: T[] = []

  for (const row of tail) {
    if (row.source !== 'generated') {
      balance = round2(balance - row.principalPart)
      out.push({ ...row, remainingBalance: balance })
      continue
    }

    if (balance <= 0)
      continue

    const interest = periodInterest(params, row.paymentNumber, balance)
    let principal = params.scheduleType === 'annuity' ? round2(payment - interest) : fixedPrincipal
    const clears = row === lastGenerated || principal >= balance
    if (clears)
      principal = balance

    const totalAmount = clears || params.scheduleType === 'differentiated'
      ? round2(principal + interest)
      : payment

    balance = round2(balance - principal)
    out.push({ ...row, interestPart: interest, principalPart: principal, remainingBalance: balance, totalAmount })
  }

  return out
}
