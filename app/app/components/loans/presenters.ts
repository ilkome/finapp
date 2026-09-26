import type { LoanCost, LoanSummary, PaymentRow } from '~/components/loans/engine/types'
import type { LoanScheduleViewRow } from '~/components/loans/ScheduleView.vue'
import type { LoanItem } from '~/components/loans/types'

import { bankDebtCheck } from '~/components/loans/engine/bankDebt'
import { bankNextPaymentAmount } from '~/components/loans/engine/derive'
import { principalFreeRows } from '~/components/loans/engine/principalFree'

type DayFormatter = (ms: number) => string

/**
 * The effective rate only earns a line when it tells something the contract does not: the bank
 * publishes no rate, or the paid interest ran off it by more than half a point.
 */
export function shownEffectiveRate(contractRate: number | null, effectiveRate: number): number | null {
  if (contractRate === null || Math.abs(effectiveRate - contractRate) > 0.5)
    return effectiveRate
  return null
}

export function toSummaryProps(params: {
  currencyCode: string
  day: DayFormatter
  debitBalance: number | null
  loan: LoanItem
  summary: LoanSummary
  today: number
}) {
  const { currencyCode, day, debitBalance, loan, summary, today } = params
  const engineNext = summary.nextPayment
  const next = engineNext && { amount: bankNextPaymentAmount(loan, engineNext) ?? engineNext.amount, date: engineNext.date }
  const overpaid = Math.round((summary.paidInterest + summary.paidFine) * 100) / 100
  const principalFree = principalFreeRows(summary.rows)
  const bankDebt = bankDebtCheck({
    bankDebtAmount: loan.bankDebtAmount,
    bankDebtUpdatedAt: loan.bankDebtUpdatedAt,
    rows: summary.rows,
    today,
    walletBalance: -summary.remaining,
  })

  return {
    bankDebt: bankDebt && { date: day(bankDebt.updatedAt), diff: bankDebt.diff, isStale: bankDebt.isStale },
    contractRate: loan.annualRate,
    currencyCode,
    debitShortfall: next && debitBalance !== null && debitBalance < next.amount
      ? Math.round((next.amount - debitBalance) * 100) / 100
      : null,
    effectiveRate: shownEffectiveRate(loan.annualRate, summary.effectiveRate),
    interestMissing: summary.interestMissing,
    isClosed: summary.isClosed,
    nextPayment: next ? { amount: next.amount, date: day(next.date) } : null,
    overdueCount: summary.overdueCount,
    overpaid,
    overpaidShare: loan.principalAmount > 0 ? overpaid / loan.principalAmount : 0,
    paidTotal: summary.paidTotal,
    plannedEndDate: summary.plannedEndDate === null ? null : day(summary.plannedEndDate),
    plannedInterest: summary.plannedInterest,
    principalFreeInterest: principalFree.settledInterest,
    principalFreeMonths: principalFree.settledMonths,
    unrecognized: summary.unrecognized,
  }
}

// Keyed by the formatter, so a container that hands over a new function on locale change gets
// a fresh cache and the old one is collected with it.
const dayCaches = new WeakMap<DayFormatter, Map<number, string>>()

function formatDayCached(ms: number, day: DayFormatter): string {
  let cache = dayCaches.get(day)
  if (!cache) {
    cache = new Map()
    dayCaches.set(day, cache)
  }
  let formatted = cache.get(ms)
  if (formatted === undefined) {
    formatted = day(ms)
    cache.set(ms, formatted)
  }
  return formatted
}

export function toScheduleViewRows(rows: PaymentRow[], overrideNumbers: Set<number>, day: DayFormatter): LoanScheduleViewRow[] {
  const principalFree = principalFreeRows(rows).byRow
  return rows.map((row) => {
    const paid = row.paidPrincipal + row.paidInterest + row.paidFine
    const isSettled = row.status === 'paid' || row.status === 'late' || row.status === 'partial'
    return {
      amount: isSettled ? paid : row.totalAmount,
      canReset: overrideNumbers.has(row.paymentNumber),
      date: formatDayCached(row.date, day),
      delta: isSettled ? Math.round((paid - row.totalAmount) * 100) / 100 : 0,
      fine: row.paidFine,
      interest: isSettled ? row.paidInterest : row.interestPart,
      isPayable: !isSettled || row.status === 'partial',
      paymentNumber: row.paymentNumber,
      principal: isSettled ? row.paidPrincipal : row.principalPart,
      principalFree: principalFree.get(row.paymentNumber) ?? null,
      status: row.status,
    }
  })
}

export function toCostProps(cost: LoanCost | undefined, currencyCode: string, month: DayFormatter) {
  return {
    byMonth: (cost?.byMonth ?? []).map(item => ({ fine: item.fine, interest: item.interest, month: month(item.month) })),
    currencyCode,
    fine: cost?.fine ?? 0,
    interest: cost?.interest ?? 0,
  }
}
