import { addCivilDays } from '~~/utils/date/civil'

import type { LoanParams, LoanTrn, PaymentRow, ScheduleRow } from '~/components/loans/engine/types'

import { rebuildTail, round2 } from '~/components/loans/engine/schedule'

export const LATE_AFTER_DAYS = 3
export const PREPAY_WINDOW_DAYS = 15

/**
 * How far a row's payment may fall short and still close it. Bank and manual rows are the bank's
 * own figures, so they match to the kopeck. A generated row is our estimate: the bank accrues
 * interest by days while we charge rate / 12, so its real payment differs by up to about 1%. The
 * shortfall is not lost either way: the balance follows the principal actually repaid.
 */
function tolerance(row: ScheduleRow, due: number): number {
  return row.source === 'generated' ? due * 0.01 : 0.005
}

function paidOf(row: PaymentRow): number {
  return round2(row.paidPrincipal + row.paidInterest)
}

/**
 * The row got what it is due, by either measure. A bank re-accrues interest by days, so on a bank
 * row the principal matches while the total moves with the interest; on a generated row the bank's
 * fixed payment matches the total while the principal moves.
 */
function isCovered(row: PaymentRow): boolean {
  return row.principalPart - row.paidPrincipal <= tolerance(row, row.principalPart)
    || row.totalAmount - paidOf(row) <= tolerance(row, row.totalAmount)
}

function interestCovered(row: PaymentRow): boolean {
  return row.interestPart - row.paidInterest <= tolerance(row, row.interestPart)
}

function isHoliday(row: ScheduleRow): boolean {
  return row.totalAmount <= 0 && row.principalPart <= 0
}

/** Money reached the row: its own transactions, or the excess of an earlier row that caught it up. */
function isTouched(row: PaymentRow): boolean {
  return row.trnIds.length > 0 || row.paidAt !== null
}

function isInterestMissing(row: PaymentRow): boolean {
  return isTouched(row) && row.paidInterest === 0 && row.interestPart > 0
}

/**
 * Principal the row actually repaid. A payment recorded without its interest expense counts wholly
 * as principal in the wallet, but the bank still took the interest out of it.
 */
function repaidOf(row: PaymentRow): number {
  if (!isTouched(row))
    return row.principalPart
  return isInterestMissing(row) ? round2(row.paidPrincipal - row.interestPart) : row.paidPrincipal
}

/**
 * What a row got beyond its own payment: the money paid over its total, counted only when the
 * principal was overpaid too. That keeps a payment without its interest expense, and a bank that
 * charged a little more interest than planned, from reading as a prepayment.
 */
function excessOf(row: PaymentRow): number {
  if (row.paidPrincipal - row.principalPart <= 0.005)
    return 0
  const excess = round2(paidOf(row) - row.totalAmount)
  return excess > 0 ? excess : 0
}

/**
 * A row stops taking transactions once BOTH its payment and its interest are covered AND money
 * actually landed in it. Requiring the interest too is what makes the order inside one payment
 * irrelevant: a payment that arrives first leaves the interest still owed, so the row stays open
 * for it. A holiday row (nothing due at all) is skipped without a transaction, an interest-only
 * row is not: it still has to collect its interest before the cursor moves on.
 */
function canSkip(row: PaymentRow): boolean {
  return isCovered(row) && interestCovered(row) && (isTouched(row) || row.totalAmount <= 0)
}

/**
 * A feed that records only payments never covers any interest, so `canSkip` alone would pile every
 * later payment into the first row. A payment from a LATER day than everything already in a
 * covered row is a new payment, not part of that one: leave the row behind. Same-day operations
 * are untouched, which is what keeps the order inside one payment irrelevant.
 */
function isLeftBehind(row: PaymentRow, trn: LoanTrn): boolean {
  return trn.kind === 'payment' && isTouched(row) && isCovered(row)
    && row.paidAt !== null && trn.date > row.paidAt
}

/**
 * Interest or a fine on the day of the row's payment is taken out of that payment, even when the
 * payment alone already covers the row: a catch-up or a late fee overpays it, and leaving the row
 * first would read the fee's share as a prepayment and drop the fee into the next row.
 */
function isSameDayCharge(row: PaymentRow, trn: LoanTrn): boolean {
  return trn.kind !== 'payment' && row.paidAt === trn.date
}

function isClosedRow(row: PaymentRow): boolean {
  return isHoliday(row) || (isTouched(row) && isCovered(row))
}

/**
 * Sequential matching: transactions by date, rows by number. Payments, interest and fines fill the
 * current row in whatever order they arrive; the cursor only moves on once both parts of the row
 * are covered, so a payment's own operations can be sorted any way at all. Every transaction lands
 * in exactly one row.
 *
 * When the cursor leaves a row, what it got beyond its own payment first pays the following rows
 * already due on that day (a skipped month caught up), and only the rest is a prepayment. The
 * balance then follows the principal actually repaid, so a prepayment, or a bank split that differs
 * from the plan, re-solves the tail right away and every later payment is matched against the plan
 * that is actually in force.
 *
 * The one date window: a payment more than `prepayWindowDays` before the next due date, with the
 * previous row closed, is a prepayment on its own day. Without it, matching by order alone would
 * take it for the next row's payment and shift every later payment one row. Inside the window a
 * payment stays the row's own, so paying a week early still works.
 */
export function reconcileSchedule(
  params: LoanParams,
  rows: ScheduleRow[],
  trns: LoanTrn[],
  today: number,
): PaymentRow[] {
  const lateAfterDays = params.lateAfterDays ?? LATE_AFTER_DAYS
  const prepayWindowDays = params.prepayWindowDays ?? PREPAY_WINDOW_DAYS

  let out: PaymentRow[] = [...rows]
    .sort((a, b) => a.paymentNumber - b.paymentNumber)
    .map(row => ({ ...row, paidAt: null, paidFine: 0, paidInterest: 0, paidPrincipal: 0, status: 'scheduled', trnIds: [] }))

  /**
   * Chain the real balance through rows `from`..`to` and re-solve the tail after `to` when it left
   * the plan. Rows before `from` already carry their real balance, so this never rescans the loan.
   */
  function rebalance(from: number, to: number) {
    let balance = from > 0 ? out[from - 1]!.remainingBalance : params.principalAmount
    for (let i = from; i < to; i++) {
      balance = round2(balance - repaidOf(out[i]!))
      out[i]!.remainingBalance = balance
    }
    balance = round2(balance - repaidOf(out[to]!))

    const row = out[to]!
    if (Math.abs(balance - row.remainingBalance) < 0.005)
      return
    row.remainingBalance = balance
    out = [...out.slice(0, to + 1), ...rebuildTail(params, out.slice(to + 1), balance)]
  }

  /** Catch up the rows already due with the excess of row `index`; returns the row it ended on. */
  function settle(index: number): number {
    let from = index
    for (;;) {
      const source = out[from]!
      const excess = excessOf(source)
      let to = from + 1
      while (out[to] && isHoliday(out[to]!) && !isTouched(out[to]!))
        to++
      const target = out[to]
      if (!excess || !target || isTouched(target) || source.paidAt === null || target.date > source.paidAt)
        break

      // The money moves, the transactions stay where they landed: the target has none of its own.
      const interest = Math.min(excess, Math.max(round2(source.paidInterest - source.interestPart), 0), target.interestPart)
      source.paidInterest = round2(source.paidInterest - interest)
      source.paidPrincipal = round2(source.paidPrincipal - excess + interest)
      target.paidInterest = round2(target.paidInterest + interest)
      target.paidPrincipal = round2(target.paidPrincipal + excess - interest)
      target.paidAt = source.paidAt
      from = to
    }
    rebalance(index, from)
    return from
  }

  /** Apply a transaction's money to a row. Interest and fines are taken out of the payment. */
  function apply(row: PaymentRow, trn: LoanTrn) {
    if (trn.kind === 'payment') {
      row.paidPrincipal = round2(row.paidPrincipal + trn.amount)
    }
    else {
      row.paidPrincipal = round2(row.paidPrincipal - trn.amount)
      if (trn.kind === 'interest')
        row.paidInterest = round2(row.paidInterest + trn.amount)
      else
        row.paidFine = round2(row.paidFine + trn.amount)
    }
    row.trnIds.push(trn.id)
  }

  let cursor = 0
  // Where the last prepayment went: the interest or fine the bank charges with it that day goes too.
  let prepaid: { date: number, index: number } | null = null
  for (const trn of [...trns].sort((a, b) => a.date - b.date)) {
    if (prepaid && trn.kind !== 'payment' && trn.date === prepaid.date) {
      apply(out[prepaid.index]!, trn)
      rebalance(prepaid.index, prepaid.index)
      continue
    }

    while (cursor < out.length - 1 && !isSameDayCharge(out[cursor]!, trn) && (canSkip(out[cursor]!) || isLeftBehind(out[cursor]!, trn))) {
      const settled = isTouched(out[cursor]!) ? settle(cursor) : cursor
      // A catch-up can stop on a row it did not fill: the next trn belongs there.
      cursor = settled > cursor ? settled : cursor + 1
    }

    const row = out[cursor]
    if (!row)
      break

    const previous = out[cursor - 1]
    if (trn.kind === 'payment' && previous && !isTouched(row) && isClosedRow(previous)
      && trn.date < addCivilDays(row.date, -prepayWindowDays)) {
      // Kept on the closed row without touching its paidAt: the prepayment moves the balance only.
      apply(previous, trn)
      rebalance(cursor - 1, cursor - 1)
      prepaid = { date: trn.date, index: cursor - 1 }
      continue
    }

    // The row collects the payment and its charges whichever lands first, so its principal
    // settles once all of the payment's operations are in.
    apply(row, trn)
    row.paidAt = Math.max(row.paidAt ?? trn.date, trn.date)
  }

  if (out[cursor] && isTouched(out[cursor]!))
    settle(cursor)

  for (const row of out) {
    if (isClosedRow(row))
      row.status = row.paidAt !== null && row.paidAt > addCivilDays(row.date, lateAfterDays) ? 'late' : 'paid'
    else if (isTouched(row))
      row.status = 'partial'
    else if (row.date < today)
      row.status = 'overdue'
    else
      row.status = 'scheduled'
  }

  return out
}
