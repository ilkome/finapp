import { describe, expect, it } from 'vitest'

import type { WalletItem } from '~/components/wallets/types'

import { graceOf, manualMinPaymentDates, minPaymentOf, minPaymentStatus } from '~/components/loans/minPayment'

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

describe('minPaymentOf', () => {
  it('counts payments that exactly cover the minimum as paid, whatever the float sum', () => {
    // 100.10 + 200.70 sums to 300.79999999999995 in floating point.
    const card = { currency: 'RUB', minPaymentAmount: 300.8, minPaymentDate: Date.UTC(2026, 9, 11), minPaymentUpdatedAt: Date.UTC(2026, 8, 11), type: 'credit' } as WalletItem
    const pay = (amount: number) => ({ amount, date: Date.UTC(2026, 8, 25), id: 'p', kind: 'payment' as const })
    expect(minPaymentOf(card, [pay(100.1), pay(200.7)], Date.UTC(2026, 9, 1))?.status).toBe('paid')
  })
})

describe('graceOf', () => {
  const statement = Date.UTC(2026, 8, 10)
  const wallet = (over: Record<string, unknown> = {}) => ({
    graceAmount: 12_000,
    graceEndDate: Date.UTC(2026, 9, 5),
    statementDate: statement,
    type: 'credit',
    ...over,
  }) as WalletItem
  const pay = (amount: number, date: number) => ({ amount, date, id: 'p', kind: 'payment' as const })

  it('is null without a reported grace amount, or without an end day while there is debt', () => {
    expect(graceOf(wallet({ graceAmount: undefined }), [], today)).toBeNull()
    expect(graceOf(wallet({ graceEndDate: undefined }), [], today)).toBeNull()
    expect(graceOf({ type: 'cash' } as unknown as WalletItem, [], today)).toBeNull()
  })

  it('is due before the end day and overdue after it', () => {
    expect(graceOf(wallet(), [], today)).toMatchObject({ amount: 12_000, status: 'due' })
    expect(graceOf(wallet({ graceEndDate: today - DAY }), [], today)?.status).toBe('overdue')
  })

  it('counts only payments since the statement day, falling back to the minimum period start', () => {
    expect(graceOf(wallet(), [pay(12_000, statement - DAY)], today)?.status).toBe('due')
    expect(graceOf(wallet(), [pay(5000, statement), pay(7000, today)], today)?.status).toBe('paid')
    const noStatement = wallet({ minPaymentUpdatedAt: statement + DAY, statementDate: undefined })
    expect(graceOf(noStatement, [pay(12_000, statement)], today)?.status).toBe('due')
    expect(graceOf(noStatement, [pay(12_000, statement + DAY)], today)?.status).toBe('paid')
  })

  it('counts payments that exactly cover the statement debt as paid, whatever the float sum', () => {
    expect(graceOf(wallet({ graceAmount: 0.8 }), [pay(0.7, statement), pay(0.1, today)], today)?.status).toBe('paid')
  })

  it('is stale when the summary is older than 40 days and nothing was paid', () => {
    expect(graceOf(wallet({ minPaymentUpdatedAt: today - 41 * DAY }), [], today)?.status).toBe('stale')
  })

  it('treats a zero statement debt as paid without needing an end day', () => {
    expect(graceOf(wallet({ graceAmount: 0, graceEndDate: undefined }), [], today)).toEqual({ amount: 0, date: null, statementDate: statement, status: 'paid' })
  })
})
