import { describe, expect, it } from 'vitest'

import type { BankReport } from '~/components/bankReports/types'
import type { UserReminderInput } from '~/components/loans/paymentReminders'
import type { TrnItem } from '~/components/trns/types'

import { localClock, planUserPushes, REMINDER_DAYS_BEFORE, reminderKeyId } from '~/components/loans/paymentReminders'
import { loanItemSchema } from '~/components/loans/types'
import { walletItemSchema } from '~/components/wallets/types'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
/** 10:00 in Moscow (UTC+3) on the given day. */
const atTen = (iso: string) => Date.parse(`${iso}T07:00:00.000Z`)

function card(over: Record<string, unknown> = {}) {
  return walletItemSchema.parse({
    currencyCode: 'RUB',
    name: 'Test card',
    type: 'credit_card',
    ...over,
    creditLimit: (over.type ?? 'credit_card') === 'credit_card' ? 10_000_000 : undefined,
  })
}
const cash = walletItemSchema.parse({ currencyCode: 'RUB', name: 'Cash', type: 'cash' })

function payment(amount: number, date: string): TrnItem {
  return {
    createdAt: 0,
    date: day(date),
    fromAmount: amount,
    fromWalletId: 'cash',
    toAmount: amount,
    toWalletId: 'card',
    type: 'transfer',
    updatedAt: 0,
  }
}

const WALLET_FIELDS = new Set(['isArchived', 'name', 'type'])

/** `fields` mixes the card's own fields and its bank report, as a test reads best. */
function input(fields: Record<string, unknown>, over: Partial<UserReminderInput> = {}): UserReminderInput {
  const wallet = Object.fromEntries(Object.entries(fields).filter(([key]) => WALLET_FIELDS.has(key)))
  const report = Object.fromEntries(Object.entries(fields).filter(([key]) => !WALLET_FIELDS.has(key))) as BankReport
  return { bankReports: { card: report }, loans: {}, locale: 'en', scheduleOverrides: {}, timezone: null, trns: {}, wallets: { card: card(wallet), cash }, ...over }
}

const min = { minPaymentAmount: 320_000, minPaymentDueDate: day('2026-10-20'), minPaymentPeriodStartDate: day('2026-10-01') }
const grace = { graceDebtAmount: 900_000, graceEndDate: day('2026-10-20'), statementDate: day('2026-10-01') }

const plan = (data: UserReminderInput, iso: string, sent: string[] = []) => planUserPushes(data, atTen(iso), new Set(sent))

describe('localClock', () => {
  it('moves the civil day at local midnight', () => {
    expect(localClock(Date.parse('2026-10-10T20:59:00Z'), 'Europe/Moscow')).toEqual({ hour: 23, today: day('2026-10-10') })
    expect(localClock(Date.parse('2026-10-10T21:00:00Z'), 'Europe/Moscow')).toEqual({ hour: 0, today: day('2026-10-11') })
    expect(localClock(Date.parse('2026-10-10T20:59:00Z'), 'Pacific/Auckland')).toEqual({ hour: 9, today: day('2026-10-11') })
  })

  it('falls back to Moscow for a null or unknown zone', () => {
    const now = Date.parse('2026-10-10T07:00:00Z')
    expect(localClock(now, null)).toEqual({ hour: 10, today: day('2026-10-10') })
    expect(localClock(now, 'Not/AZone')).toEqual({ hour: 10, today: day('2026-10-10') })
  })
})

describe('planUserPushes', () => {
  it('runs only at the local 10:00, unless the hour is ignored', () => {
    const data = input(min)
    expect(planUserPushes(data, Date.parse('2026-10-17T08:00:00Z'), new Set())).toBeNull()
    expect(planUserPushes(data, Date.parse('2026-10-17T08:00:00Z'), new Set(), { ignoreHour: true })).toHaveLength(1)
    expect(planUserPushes(input(min, { timezone: 'Asia/Vladivostok' }), Date.parse('2026-10-17T00:00:00Z'), new Set())).toHaveLength(1)
  })

  it('sends a minimum reminder from the window start until the due day and never after', () => {
    expect(REMINDER_DAYS_BEFORE).toBe(3)
    const data = input(min)
    expect(plan(data, '2026-10-16')).toEqual([])
    expect(plan(data, '2026-10-17')).toHaveLength(1)
    expect(plan(data, '2026-10-19')).toHaveLength(1)
    expect(plan(data, '2026-10-20')).toHaveLength(1)
    expect(plan(data, '2026-10-21')).toEqual([])
  })

  it('words the push in the user locale with the wallet name as the title', () => {
    expect(plan(input(min), '2026-10-17')![0]).toMatchObject({ title: 'Test card', walletId: 'card' })
    expect(plan(input(min, { locale: 'en' }), '2026-10-17')![0]!.body).toMatch(/^by 20\.10: minimum .*3,200/)
    expect(plan(input(min, { locale: 'ru' }), '2026-10-17')![0]!.body).toMatch(/^до 20\.10: минимум .*3.200/)
  })

  it('skips a minimum that is paid, stale, archived or zero', () => {
    const paid = input(min, { trns: { t1: payment(320_000, '2026-10-05') } })
    expect(plan(paid, '2026-10-17')).toEqual([])
    expect(plan(input({ ...min, minPaymentPeriodStartDate: day('2026-08-01') }), '2026-10-17')).toEqual([])
    expect(plan(input({ ...min, isArchived: true }), '2026-10-17')).toEqual([])
    expect(plan(input({ ...min, minPaymentAmount: 0 }), '2026-10-17')).toEqual([])
  })

  it('merges the minimum and the interest-free amount of one due day into one push', () => {
    const pushes = plan(input({ ...min, ...grace }), '2026-10-17')!
    expect(pushes).toHaveLength(1)
    expect(pushes[0]!.keys.map(k => k.kind)).toEqual(['minPayment', 'grace'])
    expect(pushes[0]!.body).toMatch(/^by 20\.10: minimum .*3,200.*, interest-free .*9,000/)
  })

  it('keeps different due days of one wallet apart', () => {
    const pushes = plan(input({ ...min, ...grace, graceEndDate: day('2026-10-19') }), '2026-10-17')!
    expect(pushes.map(p => p.keys.map(k => k.kind))).toEqual([['minPayment'], ['grace']])
  })

  it('skips interest-free reminders for a zero or fully paid statement debt', () => {
    expect(plan(input({ ...grace, graceDebtAmount: 0 }), '2026-10-17')).toEqual([])
    expect(plan(input(grace, { trns: { t1: payment(900_000, '2026-10-05') } }), '2026-10-17')).toEqual([])
  })

  it('reports a missed interest-free period on the day after and on later runs, but not on the day itself', () => {
    const data = input(grace)
    expect(plan(data, '2026-10-20')![0]!.keys.map(k => k.kind)).toEqual(['grace'])
    expect(plan(data, '2026-10-21')![0]!.body).toContain('interest-free period ended 20.10')
    expect(plan(data, '2026-10-22')![0]!.keys.map(k => k.kind)).toEqual(['graceMissed'])
    expect(plan(input(grace, { trns: { t1: payment(900_000, '2026-10-05') } }), '2026-10-21')).toEqual([])
  })

  it('does not repeat a reminder whose key was already sent', () => {
    const data = input({ ...min, ...grace })
    const key = (kind: 'grace' | 'minPayment') => reminderKeyId({ dueDate: day('2026-10-20'), kind, walletId: 'card' })
    expect(plan(data, '2026-10-17', [key('minPayment'), key('grace')])).toEqual([])
    const rest = plan(data, '2026-10-18', [key('minPayment')])!
    expect(rest).toHaveLength(1)
    expect(rest[0]!.keys.map(k => k.kind)).toEqual(['grace'])
  })

  it('reminds about the next unpaid payment of a loan wallet', () => {
    const wallet = { name: 'Test loan', type: 'loan' }
    const loan = loanItemSchema.parse({
      annualRatePercent: 12,
      firstPaymentDate: day('2026-10-20'),
      paymentDayOfMonth: 20,
      principalAmount: 12_000_000,
      startDate: day('2026-09-20'),
      termMonths: 12,
      walletId: 'card',
    })
    const data = input(wallet, { loans: { card: loan } })
    expect(plan(data, '2026-10-16')).toEqual([])
    const [push] = plan(data, '2026-10-17')!
    expect(push).toMatchObject({ keys: [{ dueDate: day('2026-10-20'), kind: 'loan', walletId: 'card' }], title: 'Test loan' })
    expect(push!.body).toMatch(/^by 20\.10: payment /)
    expect(plan(input({ ...wallet, isArchived: true }, { loans: { card: loan } }), '2026-10-17')).toEqual([])
  })
})
