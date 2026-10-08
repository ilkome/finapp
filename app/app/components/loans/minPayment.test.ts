import { describe, expect, it } from 'vitest'

import type { WalletItem } from '~/components/wallets/types'

import { manualMinPaymentDates, minPaymentOf, minPaymentStatus } from '~/components/loans/minPayment'

const DAY = 86_400_000
const today = Date.UTC(2026, 8, 23)

function input(over: Partial<Parameters<typeof minPaymentStatus>[0]> = {}) {
  return {
    amount: 3200,
    date: Date.UTC(2026, 8, 25),
    paidSince: 0,
    today,
    updatedAt: today - 2 * DAY,
    ...over,
  }
}

describe('minPaymentStatus', () => {
  it('is due before the date and overdue after it', () => {
    expect(minPaymentStatus(input())).toBe('due')
    expect(minPaymentStatus(input({ date: today }))).toBe('due')
    expect(minPaymentStatus(input({ date: today - DAY }))).toBe('overdue')
  })

  it('is paid once the transfers since the refresh cover the minimum', () => {
    expect(minPaymentStatus(input({ paidSince: 3199 }))).toBe('due')
    expect(minPaymentStatus(input({ paidSince: 3200 }))).toBe('paid')
  })

  it('reports a summary older than 40 days as stale, but never over a payment it can see', () => {
    expect(minPaymentStatus(input({ updatedAt: today - 41 * DAY }))).toBe('stale')
    expect(minPaymentStatus(input({ date: today - DAY, updatedAt: today - 41 * DAY }))).toBe('stale')
    expect(minPaymentStatus(input({ paidSince: 5000, updatedAt: today - 41 * DAY }))).toBe('paid')
  })
})

describe('manualMinPaymentDates', () => {
  it('starts the period a month before the due day, so an early payment counts as paid', () => {
    const due = Date.UTC(2026, 9, 11)
    const fields = manualMinPaymentDates(due)
    expect(fields).toEqual({ minPaymentDate: due, minPaymentUpdatedAt: Date.UTC(2026, 8, 11) })

    const card = { ...fields, creditLimit: 50_000, minPaymentAmount: 600, type: 'credit' } as WalletItem
    const payment = { amount: 600, date: Date.UTC(2026, 8, 25), id: 't1', kind: 'payment' as const }
    expect(minPaymentOf(card, [payment], Date.UTC(2026, 9, 1))?.status).toBe('paid')
    expect(minPaymentOf(card, [], Date.UTC(2026, 9, 12))?.status).toBe('overdue')
  })

  it('clears both fields', () => {
    expect(manualMinPaymentDates(null)).toEqual({ minPaymentDate: undefined, minPaymentUpdatedAt: undefined })
  })
})
