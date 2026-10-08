import { describe, expect, it } from 'vitest'

import type { LoanSummary, PaymentRow } from '~/components/loans/engine/types'
import type { LoanItem } from '~/components/loans/types'

import { deriveUpcoming, urgentWalletIds } from '~/components/loans/engine/upcoming'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const today = day('2026-09-10')

const loan = { debitWalletId: 'debit' } as LoanItem

function summary(date: number | null, over: Partial<PaymentRow> = {}): LoanSummary {
  const row = { date, interestPart: 120, paymentNumber: 1, principalPart: 900, status: 'scheduled', totalAmount: 1020, ...over } as PaymentRow
  return { nextPayment: date === null ? null : { amount: 1020, date }, rows: date === null ? [] : [row] } as LoanSummary
}

describe('deriveUpcoming', () => {
  it('takes one next charge per loan with its split, flags a past one as overdue and skips closed loans', () => {
    const items = deriveUpcoming([
      { currency: 'RUB', loan, summary: summary(day('2026-09-20')), walletId: 'a' },
      { currency: 'RUB', loan, summary: summary(day('2026-09-05'), { status: 'overdue' }), walletId: 'b' },
      { currency: 'RUB', loan, summary: summary(null), walletId: 'closed' },
    ], [], today)

    expect(items.map(item => item.walletId)).toEqual(['b', 'a'])
    expect(items[0]).toMatchObject({ amount: 1020, debitWalletId: 'debit', interest: 120, kind: 'loan', overdue: true, principal: 900 })
    expect(items[1]!.overdue).toBe(false)
  })

  it('prefers the bank amount when it is for the same day', () => {
    const bankLoan = { ...loan, nextPaymentDate: day('2026-09-20'), nextPaymentInterest: 130.5, nextPaymentPrincipal: 900 } as LoanItem
    const [item] = deriveUpcoming([{ currency: 'RUB', loan: bankLoan, summary: summary(day('2026-09-20')), walletId: 'a' }], [], today)
    expect(item!.amount).toBe(1030.5)
  })

  it('adds cards sorted among loans, dropping paid, stale and unreported ones', () => {
    const items = deriveUpcoming(
      [{ currency: 'RUB', loan, summary: summary(day('2026-09-20')), walletId: 'a' }],
      [
        { currency: 'RUB', minPayment: { amount: 500, date: day('2026-09-12'), status: 'due' }, walletId: 'c1' },
        { currency: 'RUB', minPayment: { amount: 500, date: day('2026-09-08'), status: 'overdue' }, walletId: 'c2' },
        { currency: 'RUB', minPayment: { amount: 500, date: day('2026-09-12'), status: 'paid' }, walletId: 'c3' },
        { currency: 'RUB', minPayment: { amount: 500, date: day('2026-09-12'), status: 'stale' }, walletId: 'c4' },
        { currency: 'RUB', minPayment: null, walletId: 'c5' },
      ],
      today,
    )
    expect(items.map(item => [item.walletId, item.kind, item.overdue])).toEqual([['c2', 'card', true], ['c1', 'card', false], ['a', 'loan', false]])
  })
})

describe('urgentWalletIds', () => {
  it('counts overdue charges and the ones due within three days', () => {
    const today = Date.UTC(2026, 9, 8)
    const at = (days: number, walletId: string) => ({ amount: 1, currency: 'RUB', date: today + days * 86_400_000, kind: 'card' as const, overdue: days < 0, walletId })
    expect([...urgentWalletIds([at(-5, 'a'), at(3, 'b'), at(4, 'c')], today)]).toEqual(['a', 'b'])
  })
})
