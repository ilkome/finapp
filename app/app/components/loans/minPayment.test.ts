import { describe, expect, it } from 'vitest'

import { minPaymentStatus } from '~/components/loans/minPayment'

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
