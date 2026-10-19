import { describe, expect, it } from 'vitest'

import type { BankReport } from '~/components/bankReports/types'
import type { WalletItem } from '~/components/wallets/types'

import { graceOf, minPaymentOf, minPaymentStatus } from '~/components/loans/minPayment'

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

describe('minPaymentOf', () => {
  const card = { type: 'credit_card' } as WalletItem
  const report = { minPaymentAmount: 60_000, minPaymentDueDate: Date.UTC(2026, 9, 11), minPaymentPeriodStartDate: Date.UTC(2026, 8, 11) } as BankReport
  const pay = (amount: number, date: number) => ({ amount, date, id: 'p', kind: 'payment' as const })

  it('is null without a reported minimum or for a wallet that is not a card', () => {
    expect(minPaymentOf(card, undefined, [], today)).toBeNull()
    expect(minPaymentOf(card, { ...report, minPaymentDueDate: undefined }, [], today)).toBeNull()
    expect(minPaymentOf({ type: 'loan' } as WalletItem, report, [], today)).toBeNull()
  })

  it('counts payments since the period start, so an early payment counts as paid', () => {
    expect(minPaymentOf(card, report, [pay(60_000, Date.UTC(2026, 8, 25))], Date.UTC(2026, 9, 1))?.status).toBe('paid')
    expect(minPaymentOf(card, report, [pay(60_000, Date.UTC(2026, 8, 10))], Date.UTC(2026, 9, 1))?.status).toBe('due')
    expect(minPaymentOf(card, report, [], Date.UTC(2026, 9, 12))?.status).toBe('overdue')
  })
})

describe('graceOf', () => {
  const statement = Date.UTC(2026, 8, 10)
  const card = { type: 'credit_card' } as WalletItem
  const report = (over: Partial<BankReport> = {}) => ({
    graceDebtAmount: 1_200_000,
    graceEndDate: Date.UTC(2026, 9, 5),
    statementDate: statement,
    ...over,
  }) as BankReport
  const pay = (amount: number, date: number) => ({ amount, date, id: 'p', kind: 'payment' as const })

  it('is null without a reported grace amount, or without an end day while there is debt', () => {
    expect(graceOf(card, report({ graceDebtAmount: undefined }), [], today)).toBeNull()
    expect(graceOf(card, report({ graceEndDate: undefined }), [], today)).toBeNull()
    expect(graceOf({ type: 'cash' } as WalletItem, report(), [], today)).toBeNull()
  })

  it('is due before the end day and overdue after it', () => {
    expect(graceOf(card, report(), [], today)).toMatchObject({ amount: 1_200_000, status: 'due' })
    expect(graceOf(card, report({ graceEndDate: today - DAY }), [], today)?.status).toBe('overdue')
  })

  it('counts only payments since the statement day, falling back to the minimum period start', () => {
    expect(graceOf(card, report(), [pay(1_200_000, statement - DAY)], today)?.status).toBe('due')
    expect(graceOf(card, report(), [pay(500_000, statement), pay(700_000, today)], today)?.status).toBe('paid')
    const noStatement = report({ minPaymentPeriodStartDate: statement + DAY, statementDate: undefined })
    expect(graceOf(card, noStatement, [pay(1_200_000, statement)], today)?.status).toBe('due')
    expect(graceOf(card, noStatement, [pay(1_200_000, statement + DAY)], today)?.status).toBe('paid')
  })

  it('is stale when the summary is older than 40 days and nothing was paid', () => {
    expect(graceOf(card, report({ minPaymentPeriodStartDate: today - 41 * DAY }), [], today)?.status).toBe('stale')
  })

  it('treats a zero statement debt as paid without needing an end day', () => {
    expect(graceOf(card, report({ graceDebtAmount: 0, graceEndDate: undefined }), [], today)).toEqual({ amount: 0, date: null, statementDate: statement, status: 'paid' })
  })
})
