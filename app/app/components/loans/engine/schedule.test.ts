import { describe, expect, it } from 'vitest'

import type { LoanParams, ScheduleOverride } from '~/components/loans/engine/types'

import { generateSchedule, rebuildTail } from '~/components/loans/engine/schedule'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)

const base: LoanParams = {
  annualRate: 12,
  firstPaymentDate: day('2026-01-15'),
  overpaymentMode: 'reducePayment',
  paymentDay: 15,
  principalAmount: 12_000,
  scheduleType: 'annuity',
  startDate: day('2025-12-15'),
  termMonths: 12,
}

const sumOf = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100

describe('generateSchedule', () => {
  it('builds a 12 month annuity that clears exactly', () => {
    const rows = generateSchedule(base)

    expect(rows).toHaveLength(12)
    expect(rows[0]).toMatchObject({ date: day('2026-01-15'), interestPart: 120, principalPart: 946.19, totalAmount: 1066.19 })
    expect(rows.slice(0, 11).every(row => row.totalAmount === 1066.19)).toBe(true)
    expect(sumOf(rows.map(row => row.principalPart))).toBe(12_000)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })

  it('builds a differentiated schedule with a fixed principal and falling interest', () => {
    const rows = generateSchedule({ ...base, scheduleType: 'differentiated' })

    expect(rows).toHaveLength(12)
    expect(rows.every(row => row.principalPart === 1000)).toBe(true)
    expect(rows[0]?.interestPart).toBe(120)
    expect(rows[1]?.interestPart).toBe(110)
    expect(rows.at(-1)?.interestPart).toBe(10)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })

  it('clamps the payment day to the length of each month', () => {
    const rows = generateSchedule({ ...base, firstPaymentDate: day('2026-01-31'), paymentDay: 31, termMonths: 4 })

    expect(rows.map(row => row.date)).toEqual([
      day('2026-01-31'),
      day('2026-02-28'),
      day('2026-03-31'),
      day('2026-04-30'),
    ])
  })

  it('continues the tail from the balance of the last override', () => {
    const override: ScheduleOverride = {
      date: day('2026-01-15'),
      interestPart: 120,
      paymentNumber: 1,
      principalPart: 2946.19,
      source: 'bank',
      totalAmount: 3066.19,
    }
    const rows = generateSchedule(base, [override])

    expect(rows[0]).toMatchObject({ remainingBalance: 9053.81, source: 'bank' })
    expect(rows[1]?.interestPart).toBe(90.54)
    expect(rows[1]?.totalAmount).toBeLessThan(1066.19)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })

  it('shifts the term by one month for a payment holiday', () => {
    const holiday: ScheduleOverride = {
      date: day('2026-02-15'),
      interestPart: 0,
      paymentNumber: 2,
      principalPart: 0,
      source: 'bank',
      totalAmount: 0,
    }
    const rows = generateSchedule({ ...base, termMonths: 4 }, [holiday])

    expect(rows).toHaveLength(5)
    expect(rows[1]?.remainingBalance).toBe(rows[0]?.remainingBalance)
    expect(rows.at(-1)?.date).toBe(day('2026-05-15'))
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })
})

describe('first period', () => {
  it('accrues daily when the first payment is not a month after the start', () => {
    const rows = generateSchedule({ ...base, startDate: day('2026-01-10') })

    // 5 days at 12%: 12 000 * 0.12 * 5 / 365.
    expect(rows[0]?.interestPart).toBe(19.73)
    expect(rows[1]?.interestPart).toBeCloseTo(rows[0]!.remainingBalance * 0.01, 2)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
    // The payment is solved with the short period in it, so the last one does not absorb the gap.
    expect(Math.abs(rows.at(-1)!.totalAmount - rows[0]!.totalAmount)).toBeLessThan(0.1)
  })
})

describe('daily interest', () => {
  it('accrues actual/365 over each period and still clears with one payment', () => {
    const rows = generateSchedule({ ...base, interestMethod: 'daily' })

    // January to February is 31 days.
    expect(rows[1]?.interestPart).toBe(Math.round(rows[0]!.remainingBalance * 0.12 * 31 / 365 * 100) / 100)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
    expect(Math.abs(rows.at(-1)!.totalAmount - rows[0]!.totalAmount)).toBeLessThan(0.1)
  })
})

describe('rebuildTail', () => {
  it('re-solves the payment over the bank rows of the tail too (reducePayment)', () => {
    const rows = generateSchedule(base)
    // Row 6 comes from the bank and repays 3 000 of principal on its own.
    const tail = rows.slice(3).map(row => row.paymentNumber === 6
      ? { ...row, interestPart: 60, principalPart: 3000, source: 'bank' as const, totalAmount: 3060 }
      : row)
    const rebuilt = rebuildTail(base, tail, 8000)
    const generated = rebuilt.filter(row => row.source === 'generated')

    expect(rebuilt.at(-1)?.remainingBalance).toBe(0)
    // The last row no longer absorbs the bank row's principal: it pays about what the others do.
    expect(Math.abs(generated.at(-1)!.totalAmount - generated[0]!.totalAmount)).toBeLessThan(1)
  })
})
