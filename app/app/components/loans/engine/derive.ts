import { addCivilDays } from '~~/utils/date/civil'

import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanParams, LoanSummary, LoanTrn, PaymentRow, ScheduleOverride } from '~/components/loans/engine/types'
import type { LoanId, LoanItem, LoanScheduleRows } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule } from '~/components/loans/engine/schedule'
import { effectiveRateOf, impliedRate, owedOf, summarizeLoan } from '~/components/loans/engine/summary'

export function paramsOf(loan: LoanItem): LoanParams {
  return {
    annualRate: loan.annualRate ?? 0,
    firstPaymentDate: loan.firstPaymentDate,
    interestMethod: loan.interestMethod,
    lateAfterDays: loan.lateAfterDays,
    overpaymentMode: loan.overpaymentMode,
    paymentDay: loan.paymentDay,
    prepayWindowDays: loan.prepayWindowDays,
    principalAmount: loan.principalAmount,
    scheduleType: loan.scheduleType,
    startDate: loan.startDate,
    termMonths: loan.termMonths,
  }
}

/** Group the stored rows once, instead of scanning them again for every loan. */
export function overridesByLoan(rows: LoanScheduleRows): Map<LoanId, ScheduleOverride[]> {
  const result = new Map<LoanId, ScheduleOverride[]>()

  for (const row of Object.values(rows)) {
    const override: ScheduleOverride = {
      date: row.date,
      interestPart: row.interestPart,
      paymentNumber: row.paymentNumber,
      principalPart: row.principalPart,
      source: row.source,
      totalAmount: row.totalAmount,
    }
    const list = result.get(row.loanId)
    if (list)
      list.push(override)
    else result.set(row.loanId, [override])
  }

  return result
}

/**
 * A loan without a contract rate is derived twice: once to learn the rate its paid interest (or,
 * before any payment, its bank schedule) implies, then at that rate, so generated rows, planned
 * interest and what-if do not run at 0%. With neither, `projectionRate` stays null.
 */
export function deriveLoan(
  loan: LoanItem,
  overrides: ScheduleOverride[],
  trns: LoanTrn[],
  walletBalance: number,
  today: number,
): LoanSummary {
  function derive(annualRate: number): LoanSummary {
    const params = { ...paramsOf(loan), annualRate }
    const schedule = generateSchedule(params, overrides)
    return summarizeLoan(params, reconcileSchedule(params, schedule, trns, today), walletBalance)
  }

  if (loan.annualRate !== null)
    return derive(loan.annualRate)

  // At 0% a paid row looks short of principal and never settles, so the probe counts every row
  // that received interest.
  const probe = derive(0)
  const rate = effectiveRateOf(probe.rows, loan.principalAmount, row => row.paidInterest > 0) || impliedRate(probe.rows)
  return rate > 0 ? derive(rate) : { ...probe, projectionRate: null }
}

/** Contract parameters at the rate the loan is projected at; null when what-if has nothing to run on. */
export function projectionParams(loan: LoanItem, summary: LoanSummary): LoanParams | null {
  return summary.projectionRate === null ? null : { ...paramsOf(loan), annualRate: summary.projectionRate }
}

/**
 * The bank's own amount for the next payment when bank sync pushed a split for that same day. The
 * engine's estimate drifts from it (Sber charges interest daily on actual/365), and a split for
 * another day is out of date.
 */
export function bankNextPaymentAmount(loan: LoanItem, next: { date: number } | null): number | null {
  if (!next || loan.nextPaymentDate !== next.date || loan.nextPaymentPrincipal === undefined || loan.nextPaymentInterest === undefined)
    return null
  return Math.round((loan.nextPaymentPrincipal + loan.nextPaymentInterest) * 100) / 100
}

/**
 * Loans answer with every row already due but unpaid plus their next scheduled payment (the bank's
 * amount when it has one); revolving products with no schedule answer with the minimum payment
 * their bank sync pushed. Nothing overdue is ever dropped, so the most urgent row always counts.
 */
export function deriveDue(
  entries: Iterable<{ bankAmount?: number | null, currency: CurrencyCode, summary: LoanSummary, walletId: WalletId }>,
  revolving: { currency: CurrencyCode, minPaymentAmount: number, minPaymentDate: number, walletId: WalletId }[],
  today: number,
  toBase: (amount: number, currencyCode: CurrencyCode) => number = amount => amount,
): { amount: number, nearestDate: number } | null {
  // A rolling window: a calendar month would go blank for the last week of every month.
  const windowEnd = addCivilDays(today, 31)
  let amount = 0
  let nearestDate: number | null = null

  function add(value: number, currency: CurrencyCode, date: number) {
    amount += toBase(value, currency)
    if (nearestDate === null || date < nearestDate)
      nearestDate = date
  }

  for (const { bankAmount, currency, summary } of entries) {
    if (summary.isClosed)
      continue
    const unpaid = summary.rows.filter((row: PaymentRow) => row.status !== 'paid' && row.status !== 'late' && row.date < windowEnd)
    for (const row of unpaid) {
      // The bank's amount is for the next payment, the first unpaid row.
      add(row === unpaid[0] && bankAmount != null ? bankAmount : owedOf(row), currency, row.date)
      if (row.date >= today)
        break
    }
  }

  for (const item of revolving) {
    if (item.minPaymentDate >= windowEnd)
      continue
    add(item.minPaymentAmount, item.currency, item.minPaymentDate)
  }

  return nearestDate === null ? null : { amount, nearestDate }
}
