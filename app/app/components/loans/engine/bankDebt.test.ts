import { describe, expect, it } from 'vitest'

import type { PaymentRow } from '~/components/loans/engine/types'

import { bankDebtCheck } from '~/components/loans/engine/bankDebt'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const rows = [{ date: day('2026-08-01') }, { date: day('2026-09-01') }, { date: day('2026-10-01') }] as PaymentRow[]
const report = { debtAmount: 25_140_050, debtReportDate: day('2026-09-22') }
const base = { report, rows, today: day('2026-09-25') }

describe('bankDebtCheck', () => {
  it('is null while the bank figure is unknown', () => {
    expect(bankDebtCheck({ ...base, report: undefined, walletBalance: -1 })).toBeNull()
    expect(bankDebtCheck({ ...base, report: { debtReportDate: report.debtReportDate }, walletBalance: -1 })).toBeNull()
  })

  it('reconciles within one minor unit of the currency', () => {
    expect(bankDebtCheck({ ...base, walletBalance: -25_140_051 })).toEqual({ diff: 0, isStale: false, updatedAt: report.debtReportDate })
    expect(bankDebtCheck({ ...base, walletBalance: -25_140_100 })?.diff).toBe(50)
  })

  it('reports how far the wallet is off the bank', () => {
    expect(bankDebtCheck({ ...base, walletBalance: -25_300_000 })?.diff).toBe(159_950)
    expect(bankDebtCheck({ ...base, walletBalance: -24_800_000 })?.diff).toBe(-340_050)
  })

  it('goes stale once a payment fell due after the bank figure was read', () => {
    expect(bankDebtCheck({ ...base, walletBalance: -25_140_050 })?.isStale).toBe(false)
    expect(bankDebtCheck({ ...base, today: day('2026-10-02'), walletBalance: -25_140_050 })?.isStale).toBe(true)
    expect(bankDebtCheck({ ...base, report: { ...report, debtReportDate: day('2026-08-15') }, walletBalance: -25_140_050 })?.isStale).toBe(true)
  })
})
