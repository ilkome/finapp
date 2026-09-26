import type { LoanParams, LoanSummary, OverpaymentMode, PaymentRow, ScheduleRow, WhatIfResult } from '~/components/loans/engine/types'

import { rebuildTail, round2 } from '~/components/loans/engine/schedule'

function isSettled(row: PaymentRow): boolean {
  return row.status === 'paid' || row.status === 'late'
}

function sum(rows: PaymentRow[], pick: (row: PaymentRow) => number): number {
  return round2(rows.reduce((total, row) => total + pick(row), 0))
}

/** What is still owed on a row: its whole amount, less what a partial payment already covered. */
export function owedOf(row: PaymentRow): number {
  return round2(Math.max(row.totalAmount - Math.max(row.paidPrincipal + row.paidInterest, 0), 0))
}

/**
 * Paid interest annualized over the average balance it was charged on:
 * `interest / months / avg(opening balance of the settled rows) * 12 * 100`.
 * Both sides count settled rows only, so a `partial` row cannot add interest without adding a month.
 * The opening balance is the real one, so a prepayment lowers it instead of leaving the plan's.
 * It answers "what rate did this loan actually cost" and is meant to sit next to the contract rate,
 * not to reproduce it: prepayments and late months move it.
 */
export function effectiveRateOf(rows: PaymentRow[], principalAmount: number, counts: (row: PaymentRow) => boolean = isSettled): number {
  // Reconciliation leaves every paid row with the real balance after it, so the next one opens on it.
  const paid = rows
    .map((row, i) => ({ opening: i === 0 ? principalAmount : rows[i - 1]!.remainingBalance, row }))
    .filter(({ row }) => counts(row))
  if (paid.length === 0)
    return 0

  const avgBalance = paid.reduce((total, { opening }) => total + opening, 0) / paid.length
  if (avgBalance <= 0)
    return 0

  const interest = paid.reduce((total, { row }) => total + row.paidInterest, 0)
  return round2((interest / paid.length / avgBalance) * 12 * 100)
}

/**
 * The yearly rate a bank schedule charges, for a loan whose contract states none: interest over the
 * opening balance of its regular rows (both parts due), so short interest-only rows do not skew it.
 */
export function impliedRate(rows: ScheduleRow[]): number {
  const regular = rows.filter(row => row.source !== 'generated' && row.interestPart > 0 && row.principalPart > 0)
  const opening = regular.reduce((total, row) => total + row.remainingBalance + row.principalPart, 0)
  if (opening <= 0)
    return 0
  return round2((regular.reduce((total, row) => total + row.interestPart, 0) / opening) * 12 * 100)
}

export function summarizeLoan(params: LoanParams, rows: PaymentRow[], walletBalance: number): LoanSummary {
  const paid = rows.filter(isSettled)
  const unpaid = rows.filter(row => !isSettled(row))

  const paidPrincipal = sum(rows, row => row.paidPrincipal)
  const paidInterest = sum(rows, row => row.paidInterest)
  const paidFine = sum(rows, row => row.paidFine)
  const paidTotal = round2(paidPrincipal + paidInterest + paidFine)
  const next = unpaid[0]

  return {
    effectiveRate: effectiveRateOf(rows, params.principalAmount),
    // A payment with no interest expense next to it: the UI asks for the missing interest.
    interestMissing: paid.filter(row => row.paidInterest === 0 && row.interestPart > 0).length,
    interestShare: paidTotal === 0 ? 0 : paidInterest / paidTotal,
    isClosed: unpaid.length === 0 && paid.length > 0,
    nextPayment: next ? { amount: owedOf(next), date: next.date } : null,
    overdueCount: rows.filter(row => row.status === 'overdue').length,
    paidFine,
    paidInterest,
    paidPrincipal,
    paidTotal,
    plannedEndDate: unpaid.at(-1)?.date ?? null,
    plannedInterest: sum(unpaid, row => row.interestPart),
    plannedTotal: sum(unpaid, row => row.totalAmount),
    projectionRate: params.annualRate,
    remaining: round2(-walletBalance),
    rows,
    unrecognized: round2(walletBalance + (params.principalAmount - paidPrincipal)),
  }
}

/** Interest saved and the new end date if `extra` went to the principal right now. */
export function whatIf(
  params: LoanParams,
  rows: PaymentRow[],
  extra: number,
  mode: OverpaymentMode,
  today: number,
): WhatIfResult {
  const from = rows.findIndex(row => !isSettled(row))
  if (from < 0)
    return { interestSaved: 0, newEndDate: null }

  const tail = rows.slice(from)
  // The paid rows carry the real balance, prepayments and the bank's own split included.
  const balance = rows[from - 1]?.remainingBalance ?? params.principalAmount
  // A bank schedule is only fact for the rows already paid: the unpaid ones are the bank's own
  // plan, which the prepayment rewrites, so they are re-solved like generated rows here.
  const plan = tail.map(row => ({ ...row, source: 'generated' as const }))
  const rebuilt = rebuildTail({ ...params, overpaymentMode: mode }, plan, round2(balance - extra))

  return {
    interestSaved: round2(sum(tail, row => row.interestPart) - sum(rebuilt, row => row.interestPart)),
    newEndDate: rebuilt.at(-1)?.date ?? today,
  }
}
