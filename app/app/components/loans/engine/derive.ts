import { roundTo } from '~~/utils/amount/round'
import { addCivilDays } from '~~/utils/date/civil'

import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanParams, LoanSummary, LoanTrn, ScheduleOverride } from '~/components/loans/engine/types'
import type { LoanId, LoanItem, LoanScheduleRows } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { currencyMinorUnit } from '~/components/currencies/currencies'
import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule } from '~/components/loans/engine/schedule'
import { closeSummary, effectiveRateOf, impliedRate, isSettled, owedOf, summarizeLoan } from '~/components/loans/engine/summary'

export function paramsOf(loan: LoanItem, precision = 2): LoanParams {
  return { ...loan, annualRate: loan.annualRate ?? 0, precision }
}

/** Group the stored rows once, instead of scanning them again for every loan. */
export function overridesByLoan(rows: LoanScheduleRows): Map<LoanId, ScheduleOverride[]> {
  return Map.groupBy(Object.values(rows), row => row.loanId)
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
  precision = 2,
): LoanSummary {
  function derive(annualRate: number): LoanSummary {
    const params = { ...paramsOf(loan, precision), annualRate }
    const schedule = generateSchedule(params, overrides)
    return summarizeLoan(params, reconcileSchedule(params, schedule, trns, today), walletBalance)
  }

  function open(): LoanSummary {
    if (loan.annualRate !== null)
      return derive(loan.annualRate)

    // At 0% a paid row looks short of principal and never settles, so the probe counts every row
    // that received interest.
    const probe = derive(0)
    const rate = effectiveRateOf(probe.rows, loan.principalAmount, row => row.paidInterest > 0) || impliedRate(probe.rows)
    return rate > 0 ? derive(rate) : { ...probe, projectionRate: null }
  }

  if (loan.closedDate != null)
    return closeSummary(open(), loan.closedDate)

  // The bank's own split beats the engine's estimate everywhere the next payment is shown.
  const summary = open()
  const bankAmount = bankNextPaymentAmount(loan, summary.nextPayment, precision)
  return bankAmount === null ? summary : { ...summary, nextPayment: { ...summary.nextPayment!, amount: bankAmount } }
}

type DeriveInputs = {
  loan: LoanItem
  overrides: ScheduleOverride[]
  precision: number
  summary: LoanSummary
  today: number
  trnsKey: string
  walletBalance: number
}

/**
 * `deriveLoan` with a per-loan cache: any trn edit rebuilds the credit-trn lists and wallet
 * balances, but a loan whose own inputs did not change keeps its previous summary instead of
 * regenerating the whole schedule. `loan` and `overrides` compare by reference (the store keeps
 * them stable), the loan's trns by content.
 */
export function createDeriveLoanMemo() {
  const cache = new Map<LoanId, DeriveInputs>()

  /** Forget loans that no longer exist, so a deleted loan's schedule is not held for the session. */
  function prune(loanIds: ReadonlySet<LoanId>) {
    for (const loanId of cache.keys()) {
      if (!loanIds.has(loanId))
        cache.delete(loanId)
    }
  }

  return Object.assign((
    loanId: LoanId,
    loan: LoanItem,
    overrides: ScheduleOverride[],
    trns: LoanTrn[],
    walletBalance: number,
    today: number,
    precision = 2,
  ): LoanSummary => {
    const trnsKey = trns.map(trn => `${trn.id}:${trn.amount}:${trn.date}:${trn.kind}`).join('|')
    const hit = cache.get(loanId)
    if (hit && hit.loan === loan && hit.overrides === overrides && hit.trnsKey === trnsKey
      && hit.walletBalance === walletBalance && hit.today === today && hit.precision === precision) {
      return hit.summary
    }
    const summary = deriveLoan(loan, overrides, trns, walletBalance, today, precision)
    cache.set(loanId, { loan, overrides, precision, summary, today, trnsKey, walletBalance })
    return summary
  }, { prune })
}

/** Contract parameters at the rate the loan is projected at; null when what-if has nothing to run on. */
export function projectionParams(loan: LoanItem, summary: LoanSummary, precision = 2): LoanParams | null {
  return summary.projectionRate === null ? null : { ...paramsOf(loan, precision), annualRate: summary.projectionRate }
}

/**
 * The bank's own amount for the next payment when bank sync pushed a split for that same day. The
 * engine's estimate drifts from it (a bank may charge interest daily on actual/365), and a split for
 * another day is out of date.
 */
export function bankNextPaymentAmount(loan: LoanItem, next: { date: number } | null, precision = 2): number | null {
  if (!next || loan.nextPaymentDate !== next.date || loan.nextPaymentPrincipal === undefined || loan.nextPaymentInterest === undefined)
    return null
  return roundTo(loan.nextPaymentPrincipal + loan.nextPaymentInterest, precision)
}

/**
 * Loans answer with every row already due but unpaid plus their next scheduled payment (the bank's
 * amount when it has one); revolving products with no schedule answer with the minimum payment
 * their bank sync pushed. Nothing overdue is ever dropped, so the most urgent row always counts.
 */
export function deriveDue(
  entries: Iterable<{ currency: CurrencyCode, summary: LoanSummary, walletId: WalletId }>,
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

  for (const { currency, summary } of entries) {
    if (summary.isClosed)
      continue
    const unpaid = summary.rows.filter(row => !isSettled(row) && row.date < windowEnd)
    // Everything overdue plus the next due day, with every row on that day (interest-only beside the regular one).
    let dueDate: number | null = null
    for (const row of unpaid) {
      if (dueDate !== null && row.date > dueDate)
        break
      // The next payment carries the bank's amount when bank sync pushed one.
      const next = summary.nextPayment
      add(row === unpaid[0] && next?.date === row.date ? next.amount : owedOf(row, currencyMinorUnit(currency)), currency, row.date)
      if (row.date >= today)
        dueDate ??= row.date
    }
  }

  for (const item of revolving) {
    if (item.minPaymentDate >= windowEnd)
      continue
    add(item.minPaymentAmount, item.currency, item.minPaymentDate)
  }

  return nearestDate === null ? null : { amount, nearestDate }
}
