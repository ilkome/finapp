import { describe, expect, it } from 'vitest'

import type { PaymentRow } from '~/components/loans/engine/types'

import { bankDebtCheck } from '~/components/loans/engine/bankDebt'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const rows = [{ date: day('2026-08-01') }, { date: day('2026-09-01') }, { date: day('2026-10-01') }] as PaymentRow[]
const base = { bankDebtAmount: 251_400.5, bankDebtUpdatedAt: day('2026-09-22'), rows, today: day('2026-09-25') }

describe('bankDebtCheck', () => {
  it('is null until bank sync pushed a figure', () => {
    expect(bankDebtCheck({ ...base, bankDebtAmount: undefined, walletBalance: -1 })).toBeNull()
  })

  it('reconciles within 1 unit of rounding', () => {
    expect(bankDebtCheck({ ...base, walletBalance: -251_401 })).toEqual({ diff: 0, isStale: false, updatedAt: base.bankDebtUpdatedAt })
  })

  it('reports how far the wallet is off the bank', () => {
    expect(bankDebtCheck({ ...base, walletBalance: -253_000 })?.diff).toBe(1599.5)
    expect(bankDebtCheck({ ...base, walletBalance: -248_000 })?.diff).toBe(-3400.5)
  })

  it('goes stale once a payment fell due after the bank figure was read', () => {
    expect(bankDebtCheck({ ...base, walletBalance: -251_400.5 })?.isStale).toBe(false)
    expect(bankDebtCheck({ ...base, today: day('2026-10-02'), walletBalance: -251_400.5 })?.isStale).toBe(true)
    expect(bankDebtCheck({ ...base, bankDebtUpdatedAt: day('2026-08-15'), walletBalance: -251_400.5 })?.isStale).toBe(true)
  })
})
