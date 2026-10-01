import { describe, expect, it } from 'vitest'

import type { LoanParams, LoanTrn } from '~/components/loans/engine/types'

import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule, round2 } from '~/components/loans/engine/schedule'
import { summarizeLoan, whatIf } from '~/components/loans/engine/summary'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)

const params: LoanParams = {
  annualRate: 12,
  firstPaymentDate: day('2026-01-15'),
  overpaymentMode: 'reducePayment',
  paymentDay: 15,
  principalAmount: 12_000,
  scheduleType: 'annuity',
  startDate: day('2025-12-15'),
  termMonths: 12,
}

const rows = generateSchedule(params)
const today = day('2026-03-01')

function payment(n: number, date: string, principal: number, interest: number): LoanTrn[] {
  return [
    { amount: interest, date: day(date), id: `p${n}i`, kind: 'interest' },
    { amount: round2(principal + interest), date: day(date), id: `p${n}p`, kind: 'payment' },
  ]
}

describe('reconcileSchedule', () => {
  it('fills a row from two payment operations and marks a delayed payment late', () => {
    const trns: LoanTrn[] = [
      { amount: 120, date: day('2026-01-15'), id: 'a1', kind: 'interest' },
      { amount: 1020, date: day('2026-01-15'), id: 'a2', kind: 'payment' },
      { amount: 46.19, date: day('2026-01-16'), id: 'a3', kind: 'payment' },
      ...payment(2, '2026-02-25', 955.65, 110.54),
    ]
    const out = reconcileSchedule(params, rows, trns, today)

    expect(out[0]?.status).toBe('paid')
    expect(out[0]?.trnIds).toEqual(['a1', 'a2', 'a3'])
    expect(out[0]?.paidPrincipal).toBe(946.19)
    expect(out[1]?.status).toBe('late')
    expect(out[1]?.paidAt).toBe(day('2026-02-25'))
  })

  it('marks an untouched past row overdue and keeps a short payment partial', () => {
    const trns: LoanTrn[] = [
      { amount: 120, date: day('2026-01-15'), id: 'b1', kind: 'interest' },
      { amount: 620, date: day('2026-01-15'), id: 'b2', kind: 'payment' },
    ]
    const out = reconcileSchedule(params, rows, trns, today)

    expect(out[0]?.status).toBe('partial')
    expect(out[1]?.status).toBe('overdue')
    expect(out[2]?.status).toBe('scheduled')
    expect(summarizeLoan(params, out, -11_500).overdueCount).toBe(1)
  })

  it('reconciles a payment the same way whichever of its two operations comes first', () => {
    const [interest, principal] = payment(1, '2026-01-15', 946.19, 120) as [LoanTrn, LoanTrn]
    const forward = reconcileSchedule(params, rows, [interest, principal], today)
    const reversed = reconcileSchedule(params, rows, [principal, interest], today)

    expect(reversed).toEqual(forward.map(row => ({ ...row, trnIds: [...row.trnIds].reverse() })))
    expect(forward[0]).toMatchObject({ paidInterest: 120, paidPrincipal: 946.19, status: 'paid' })
  })

  it('takes interest out of the payment whether the bank charges it before or after the transfer', () => {
    const before = reconcileSchedule(params, rows, [
      { amount: 120, date: day('2026-01-15'), id: 'i', kind: 'interest' },
      { amount: 1066.19, date: day('2026-01-17'), id: 'm', kind: 'payment' },
    ], today)
    const after = reconcileSchedule(params, rows, [
      { amount: 1066.19, date: day('2026-01-14'), id: 'm', kind: 'payment' },
      { amount: 120, date: day('2026-01-15'), id: 'i', kind: 'interest' },
    ], today)

    for (const out of [before, after]) {
      expect(out[0]).toMatchObject({ paidInterest: 120, paidPrincipal: 946.19 })
      expect(['paid', 'late']).toContain(out[0]?.status)
      expect(out[1]?.trnIds).toEqual([])
    }
  })

  it('reads interest charged with no payment as debt that grew', () => {
    const out = reconcileSchedule(params, rows, [{ amount: 120, date: day('2026-01-15'), id: 'i', kind: 'interest' }], today)
    expect(out[0]).toMatchObject({ paidInterest: 120, paidPrincipal: -120, status: 'partial' })
  })

  it('advances a row per payment when the feed records payments only', () => {
    const dates = ['2026-01-15', '2026-02-15', '2026-03-15']
    const trns: LoanTrn[] = dates.map((date, i) => ({
      amount: rows[i]!.totalAmount,
      date: day(date),
      id: `n${i}`,
      kind: 'payment',
    }))
    const out = reconcileSchedule(params, rows, trns, day('2026-04-01'))

    expect(out).toHaveLength(12)
    expect(out.slice(0, 3).map(row => row.trnIds)).toEqual([['n0'], ['n1'], ['n2']])
    expect(out.slice(0, 3).every(row => row.status === 'paid')).toBe(true)
    expect(out[3]?.status).toBe('scheduled')
  })

  it('keeps the term and lowers the payment after an overpayment (reducePayment)', () => {
    const out = reconcileSchedule(params, rows, payment(1, '2026-01-15', 3946.19, 120), today)

    expect(out).toHaveLength(12)
    expect(out[0]?.remainingBalance).toBe(8053.81)
    expect(out[1]?.totalAmount).toBeLessThan(1066.19)
    expect(out.at(-1)?.remainingBalance).toBe(0)
  })

  it('keeps the payment and shortens the term after an overpayment (reduceTerm)', () => {
    const reduceTerm: LoanParams = { ...params, overpaymentMode: 'reduceTerm' }
    const out = reconcileSchedule(reduceTerm, rows, payment(1, '2026-01-15', 3946.19, 120), today)

    expect(out.length).toBeLessThan(12)
    expect(out[1]?.totalAmount).toBe(1066.19)
    expect(out.at(-1)?.remainingBalance).toBe(0)
  })
})

describe('summarizeLoan', () => {
  const out = reconcileSchedule(params, rows, payment(1, '2026-01-15', 946.19, 120), today)
  const summary = summarizeLoan(params, out, -11_053.81)

  it('reports the paid facts and the plan left', () => {
    expect(summary.paidTotal).toBe(1066.19)
    expect(summary.paidPrincipal).toBe(946.19)
    expect(summary.remaining).toBe(11_053.81)
    expect(summary.unrecognized).toBe(0)
    expect(summary.isClosed).toBe(false)
    expect(summary.nextPayment).toEqual({ amount: 1066.19, date: day('2026-02-15') })
    expect(summary.plannedEndDate).toBe(day('2026-12-15'))
    expect(summary.effectiveRate).toBeCloseTo(12, 0)
  })

  it('keeps the rate on the settled rows when a later payment is still partial', () => {
    const withPartial = reconcileSchedule(
      params,
      rows,
      [...payment(1, '2026-01-15', 946.19, 120), { amount: 500, date: day('2026-02-15'), id: 'p2p', kind: 'payment' }],
      today,
    )

    expect(withPartial[1]?.status).toBe('partial')
    expect(summarizeLoan(params, withPartial, -10_553.81).effectiveRate).toBeCloseTo(12, 0)
    expect(summarizeLoan(params, withPartial, -10_553.81).unrecognized).toBe(0)
  })

  it('projects the saving of an extra principal payment', () => {
    const result = whatIf(params, out, 3000, 'reduceTerm', today)

    expect(result.interestSaved).toBeGreaterThan(0)
    expect(result.newEndDate).toBeLessThan(day('2026-12-15'))
  })
})

describe('reconcileSchedule after a deviation from the plan', () => {
  const big: LoanParams = { ...params, principalAmount: 120_000 }
  const until = day('2026-08-01')

  /** Pays every due row the amount the app currently plans for it; `extras[n]` goes on top of payment n. */
  function payAsPlanned(loan: LoanParams, extras: Record<number, number> = {}, more: LoanTrn[] = []) {
    const trns: LoanTrn[] = []
    for (;;) {
      const out = reconcileSchedule(loan, generateSchedule(loan), trns, until)
      const row = out.find(r => r.trnIds.length === 0 && r.totalAmount > 0)
      const arrived = more.filter(trn => !trns.includes(trn) && trn.date < (row?.date ?? until))
      if (arrived.length > 0) {
        trns.push(...arrived)
        continue
      }
      if (!row || row.date > until)
        return out
      trns.push(...payment(row.paymentNumber, new Date(row.date).toISOString().slice(0, 10), row.principalPart + (extras[row.paymentNumber] ?? 0), row.interestPart))
    }
  }

  for (const mode of ['reducePayment', 'reduceTerm'] as const) {
    it(`keeps every payment after a prepayment paid (${mode})`, () => {
      const out = payAsPlanned({ ...big, overpaymentMode: mode }, { 3: 30_000 })
      const past = out.filter(row => row.date < until)

      expect(past).toHaveLength(7)
      expect(past.every(row => row.status === 'paid')).toBe(true)
      expect(out.at(-1)?.remainingBalance).toBe(0)
      if (mode === 'reducePayment')
        expect(out[3]?.totalAmount).toBeLessThan(out[1]!.totalAmount)
      else
        expect(out.length).toBeLessThan(12)
    })

    it(`reads a payment on its own day as a prepayment, not the next row (${mode})`, () => {
      const out = payAsPlanned({ ...big, overpaymentMode: mode }, {}, [{ amount: 30_000, date: day('2026-02-25'), id: 'extra', kind: 'payment' }])

      expect(out.filter(row => row.date < until).every(row => row.status === 'paid')).toBe(true)
      expect(out[1]?.trnIds).toContain('extra')
      expect(out[1]?.paidAt).toBe(day('2026-02-15'))
      expect(out.find(row => row.date > until)?.status).toBe('scheduled')
    })

    it(`catches up a skipped month with a double payment (${mode})`, () => {
      const loan = { ...big, overpaymentMode: mode }
      const plan = generateSchedule(loan)
      const [r1, r2, r3, r4] = plan as [typeof plan[0], typeof plan[0], typeof plan[0], typeof plan[0]]
      const trns = [
        ...payment(1, '2026-01-15', r1.principalPart, r1.interestPart),
        ...payment(2, '2026-02-15', r2.principalPart, r2.interestPart),
        ...payment(4, '2026-04-15', r3.principalPart + r4.principalPart, round2(r3.interestPart + r4.interestPart)),
      ]
      const out = reconcileSchedule(loan, plan, trns, day('2026-04-20'))

      expect(out.map(row => row.status).slice(0, 5)).toEqual(['paid', 'paid', 'late', 'paid', 'scheduled'])
      expect(out[4]?.totalAmount).toBe(r1.totalAmount)
      expect(out).toHaveLength(12)
    })
  }

  it('keeps a late fee charged after its catch-up payment in that payment', () => {
    const plan = generateSchedule(big)
    const [r1, r2, r3] = plan as [typeof plan[0], typeof plan[0], typeof plan[0]]
    const trns: LoanTrn[] = [
      ...payment(1, '2026-01-15', r1.principalPart, r1.interestPart),
      { amount: round2(r2.totalAmount + r3.totalAmount + 700), date: day('2026-03-15'), id: 'm', kind: 'payment' },
      { amount: round2(r2.interestPart + r3.interestPart), date: day('2026-03-15'), id: 'i', kind: 'interest' },
      { amount: 700, date: day('2026-03-15'), id: 'f', kind: 'fine' },
    ]
    const out = reconcileSchedule(big, plan, trns, day('2026-03-20'))

    expect(out.map(row => row.status).slice(0, 4)).toEqual(['paid', 'late', 'paid', 'scheduled'])
    expect(out[1]?.paidFine).toBe(700)
    expect(out[3]?.totalAmount).toBe(r1.totalAmount)
  })

  it('puts every transaction into exactly one row', () => {
    const plan = generateSchedule(big)
    const [r1, r2, r3] = plan as [typeof plan[0], typeof plan[0], typeof plan[0]]
    const trns: LoanTrn[] = [
      ...payment(1, '2026-01-15', r1.principalPart, r1.interestPart),
      { amount: round2(r2.totalAmount + r3.totalAmount + 700), date: day('2026-03-15'), id: 'm', kind: 'payment' },
      { amount: round2(r2.interestPart + r3.interestPart), date: day('2026-03-15'), id: 'i', kind: 'interest' },
      { amount: 700, date: day('2026-03-15'), id: 'f', kind: 'fine' },
      { amount: 5000, date: day('2026-03-25'), id: 'extra', kind: 'payment' },
    ]
    const ids = reconcileSchedule(big, plan, trns, day('2026-03-30')).flatMap(row => row.trnIds)

    expect(ids.sort()).toEqual(trns.map(trn => trn.id).sort())
  })

  it('carries a kopeck shortfall of a generated row into the tail', () => {
    const plan = generateSchedule(big)
    const r1 = plan[0]!
    // 5.00 short: inside the 1% a generated row allows, so the row is paid, but the debt is not lost.
    const out = reconcileSchedule(big, plan, payment(1, '2026-01-15', r1.principalPart - 5, r1.interestPart), day('2026-01-20'))

    expect(out[0]?.status).toBe('paid')
    expect(out[0]?.remainingBalance).toBe(round2(r1.remainingBalance + 5))
    expect(round2(out[0]!.paidPrincipal + out.slice(1).reduce((total, row) => total + row.principalPart, 0))).toBe(120_000)
  })

  it('matches a bank row to the kopeck', () => {
    const bankRows = generateSchedule(big).map(row => ({ ...row, source: 'bank' as const }))
    const r1 = bankRows[0]!
    const short = reconcileSchedule(big, bankRows, payment(1, '2026-01-15', r1.principalPart - 0.01, r1.interestPart), day('2026-01-20'))
    const exact = reconcileSchedule(big, bankRows, payment(1, '2026-01-15', r1.principalPart, r1.interestPart), day('2026-01-20'))

    expect(short[0]?.status).toBe('partial')
    expect(exact[0]?.status).toBe('paid')
  })

  it('takes the late threshold and the prepayment window from the loan', () => {
    const plan = generateSchedule(big)
    const r1 = plan[0]!
    const fiveDaysLate = payment(1, '2026-01-20', r1.principalPart, r1.interestPart)

    expect(reconcileSchedule(big, plan, fiveDaysLate, day('2026-01-25'))[0]?.status).toBe('late')
    expect(reconcileSchedule({ ...big, lateAfterDays: 5 }, plan, fiveDaysLate, day('2026-01-25'))[0]?.status).toBe('paid')

    const early: LoanTrn[] = [...payment(1, '2026-01-15', r1.principalPart, r1.interestPart), { amount: 20_000, date: day('2026-02-05'), id: 'e', kind: 'payment' }]
    // Ten days before the due date: the row's own early payment by default, a prepayment with a 5 day window.
    expect(reconcileSchedule(big, plan, early, day('2026-02-06'))[1]?.trnIds).toContain('e')
    expect(reconcileSchedule({ ...big, prepayWindowDays: 5 }, plan, early, day('2026-02-06'))[0]?.trnIds).toContain('e')
  })

  it('shows the re-solved amount on the rows paid after a prepayment', () => {
    const out = payAsPlanned(big, { 3: 30_000 })
    expect(out[3]?.totalAmount).toBe(out[4]?.totalAmount)
    expect(out[3]?.paidPrincipal).toBe(out[3]?.principalPart)
  })
})

describe('summarizeLoan after a deviation from the plan', () => {
  const big: LoanParams = { ...params, principalAmount: 120_000 }

  function paid(loan: LoanParams, extras: Record<number, number>, until: number) {
    const trns: LoanTrn[] = []
    for (;;) {
      const out = reconcileSchedule(loan, generateSchedule(loan), trns, until)
      const row = out.find(r => r.trnIds.length === 0 && r.totalAmount > 0)
      if (!row || row.date > until)
        return { out, trns }
      trns.push(...payment(row.paymentNumber, new Date(row.date).toISOString().slice(0, 10), row.principalPart + (extras[row.paymentNumber] ?? 0), row.interestPart))
    }
  }

  for (const mode of ['reducePayment', 'reduceTerm'] as const) {
    it(`keeps the effective rate on the contract rate after a prepayment (${mode})`, () => {
      const loan = { ...big, overpaymentMode: mode }
      const { out } = paid(loan, { 3: 30_000 }, day('2026-08-01'))
      const principal = out.reduce((total, row) => total + row.paidPrincipal, 0)
      const summary = summarizeLoan(loan, out, -(120_000 - principal))

      expect(summary.effectiveRate).toBeCloseTo(12, 1)
      expect(summary.interestMissing).toBe(0)
    })

    it(`projects what-if from the real debt (${mode})`, () => {
      const loan = { ...big, overpaymentMode: mode }
      const { out } = paid(loan, { 3: 30_000 }, day('2026-08-01'))
      const summary = summarizeLoan(loan, out, -round2(120_000 - out.reduce((total, row) => total + row.paidPrincipal, 0)))
      const all = whatIf(loan, out, summary.remaining, 'reduceTerm', day('2026-08-01'))

      expect(all.interestSaved).toBeCloseTo(summary.plannedInterest, 2)
      expect(all.newEndDate).toBe(day('2026-08-01'))
    })
  }

  it('reports what a partial row still owes as the next payment', () => {
    const out = reconcileSchedule(params, rows, [{ amount: 500, date: day('2026-01-15'), id: 'part', kind: 'payment' }], day('2026-01-20'))
    expect(summarizeLoan(params, out, -11_500).nextPayment).toEqual({ amount: 566.19, date: day('2026-01-15') })
  })

  it('flags payments recorded without their interest and does not read them as prepayments', () => {
    const trns: LoanTrn[] = [1, 2, 3].map(n => ({ amount: 1066.19, date: day(`2026-0${n}-15`), id: `m${n}`, kind: 'payment' }))
    const out = reconcileSchedule(params, rows, trns, day('2026-03-20'))
    const summary = summarizeLoan(params, out, -(12_000 - 3 * 1066.19))

    expect(out.slice(0, 3).every(row => row.status === 'paid')).toBe(true)
    expect(out[3]?.totalAmount).toBe(1066.19)
    expect(summary.interestMissing).toBe(3)
  })
})
