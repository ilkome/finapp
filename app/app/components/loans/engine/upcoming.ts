import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanSummary } from '~/components/loans/engine/types'
import type { MinPaymentStatus } from '~/components/loans/minPayment'
import type { LoanItem } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { bankNextPaymentAmount } from '~/components/loans/engine/derive'

export type UpcomingItem = {
  amount: number
  currency: CurrencyCode
  date: number
  debitWalletId?: WalletId
  interest?: number
  kind: 'card' | 'loan'
  /** The charge date is already behind us. */
  overdue: boolean
  principal?: number
  walletId: WalletId
}

export type UpcomingLoan = { currency: CurrencyCode, loan: LoanItem, summary: LoanSummary, walletId: WalletId }
export type UpcomingCard = {
  currency: CurrencyCode
  minPayment: { amount: number, date: number, status: MinPaymentStatus } | null
  walletId: WalletId
}

/** Days ahead a charge counts as urgent for the reminder badge. */
export const URGENT_DAYS = 3

/** Products with a charge overdue or due within `URGENT_DAYS`. */
export function urgentWalletIds(items: UpcomingItem[], today: number): Set<WalletId> {
  const until = today + URGENT_DAYS * 86_400_000
  return new Set(items.filter(item => item.date <= until).map(item => item.walletId))
}

/** The next charge of every credit product, one per product, soonest first. */
export function deriveUpcoming(loans: UpcomingLoan[], cards: UpcomingCard[], today: number): UpcomingItem[] {
  const items: UpcomingItem[] = []

  for (const { currency, loan, summary, walletId } of loans) {
    const next = summary.nextPayment
    if (!next)
      continue
    const row = summary.rows.find(r => r.date === next.date && r.status !== 'paid' && r.status !== 'late')
    items.push({
      amount: bankNextPaymentAmount(loan, next) ?? next.amount,
      currency,
      date: next.date,
      debitWalletId: loan.debitWalletId,
      interest: row?.interestPart,
      kind: 'loan',
      overdue: next.date < today,
      principal: row?.principalPart,
      walletId,
    })
  }

  for (const { currency, minPayment, walletId } of cards) {
    if (!minPayment || minPayment.status === 'paid' || minPayment.status === 'stale')
      continue
    items.push({ amount: minPayment.amount, currency, date: minPayment.date, kind: 'card', overdue: minPayment.date < today, walletId })
  }

  return items.sort((a, b) => a.date - b.date)
}
