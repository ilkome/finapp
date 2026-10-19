import type { LoanParams, LoanSummary, PaymentRow, PrepaymentMode, ScheduleRow, WhatIfResult } from '~/components/loans/engine/types'

import { rebuildTail } from '~/components/loans/engine/schedule'

export function isSettled(row: PaymentRow): boolean {
  return row.status === 'paid' || row.status === 'late'
}

function sum(rows: PaymentRow[], pick: (row: PaymentRow) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0)
}

/** What is still owed on a row: its whole amount, less what a partial payment already covered. */
export function owedOf(row: PaymentRow): number {
  return Math.max(row.totalAmount - Math.max(row.paidPrincipal + row.paidInterest, 0), 0)
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
  return Math.round((interest / paid.length / avgBalance) * 12 * 100 * 100) / 100
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
  return Math.round((regular.reduce((total, row) => total + row.interestPart, 0) / opening) * 12 * 100 * 100) / 100
}

/**
 * A loan the user marked closed (the bank closed it, a balance gap remains): the unpaid plan is
 * dropped, so nothing is due, overdue or projected.
 */
export function closeSummary(summary: LoanSummary, closedDate: number): LoanSummary {
  return {
    ...summary,
    closedDate,
    firstUnpaidIndex: -1,
    isClosed: true,
    monthsLeft: 0,
    nextPayment: null,
    overdueCount: 0,
    plannedEndDate: null,
    plannedInterest: 0,
    plannedTotal: 0,
    rows: summary.rows.filter(isSettled),
  }
}

export function summarizeLoan(params: LoanParams, rows: PaymentRow[], walletBalance: number): LoanSummary {
  const paid = rows.filter(isSettled)
  const unpaid = rows.filter(row => !isSettled(row))

  const paidPrincipal = sum(rows, row => row.paidPrincipal)
  const paidInterest = sum(rows, row => row.paidInterest)
  const paidFine = sum(rows, row => row.paidFine)
  const paidTotal = paidPrincipal + paidInterest + paidFine
  const next = unpaid[0]
  const isClosed = unpaid.length === 0 && paid.length > 0

  return {
    closedDate: isClosed ? Math.max(...paid.map(row => row.lastPaymentAt ?? row.paidAt ?? row.date)) : null,
    effectiveRate: effectiveRateOf(rows, params.principalAmount),
    firstUnpaidIndex: rows.findIndex(row => !isSettled(row)),
    // A payment with no interest expense next to it: the UI asks for the missing interest.
    interestMissing: paid.filter(row => row.paidInterest === 0 && row.interestPart > 0).length,
    interestShare: paidTotal === 0 ? 0 : paidInterest / paidTotal,
    isClosed,
    monthsLeft: unpaid.length,
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
    remaining: -walletBalance,
    rows,
    unrecognized: walletBalance + (params.principalAmount - paidPrincipal),
  }
}

const modelBaselines = new WeakMap<PaymentRow[], Map<string, number>>()

/** Interest saved and the new end date if `extra` went to the principal right now. */
export function whatIf(
  params: LoanParams,
  rows: PaymentRow[],
  extra: number,
  mode: PrepaymentMode,
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
  const solve = (start: number) => rebuildTail({ ...params, prepaymentMode: mode }, plan, start, rows[from - 1]?.date)
  const rebuilt = solve(Math.round(balance - Math.max(0, extra)))

  // Our re-solve charges interest with the model's accrual while the bank's plan accrues its own
  // way, so the two never agree even with nothing extra paid. Scale the re-solved
  // interest by how far the model is off the plan: no extra saves 0, paying it all off saves the
  // whole planned interest.
  const planned = sum(tail, row => row.interestPart)
  // The baseline does not depend on `extra`: solve it once per schedule and mode, not per keystroke.
  const baselines = modelBaselines.get(rows) ?? new Map<string, number>()
  modelBaselines.set(rows, baselines)
  const baselineKey = `${mode}:${params.annualRate}`
  const model = baselines.get(baselineKey) ?? sum(solve(balance), row => row.interestPart)
  baselines.set(baselineKey, model)
  const scale = model > 0 ? planned / model : 1

  return {
    interestSaved: Math.round(planned - sum(rebuilt, row => row.interestPart) * scale),
    newEndDate: rebuilt.at(-1)?.date ?? null,
  }
}
