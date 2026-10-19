import { describe, expect, it } from 'vitest'

import { loanIdFor, loanItemSchema, loanScheduleOverrideIdFor } from '~/components/loans/types'

describe('loanIdFor', () => {
  it('is deterministic per wallet', () => {
    expect(loanIdFor('wallet-1')).toBe(loanIdFor('wallet-1'))
    expect(loanIdFor('wallet-1')).not.toBe(loanIdFor('wallet-2'))
  })
})

describe('loanScheduleOverrideIdFor', () => {
  it('is deterministic per loan and payment number', () => {
    expect(loanScheduleOverrideIdFor('loan-1', 3)).toBe(loanScheduleOverrideIdFor('loan-1', 3))
    expect(loanScheduleOverrideIdFor('loan-1', 3)).not.toBe(loanScheduleOverrideIdFor('loan-1', 4))
    expect(loanScheduleOverrideIdFor('loan-1', 3)).not.toBe(loanScheduleOverrideIdFor('loan-2', 3))
  })
})

describe('loanItemSchema', () => {
  it('keeps a numeric rate and reads a missing or null rate as unknown', () => {
    expect(loanItemSchema.parse({ annualRatePercent: 0, firstPaymentDate: 0, startDate: 0, walletId: 'w' }).annualRatePercent).toBe(0)
    expect(loanItemSchema.parse({ annualRatePercent: 24.5, firstPaymentDate: 0, startDate: 0, walletId: 'w' }).annualRatePercent).toBe(24.5)
    expect(loanItemSchema.parse({ annualRatePercent: null, firstPaymentDate: 0, startDate: 0, walletId: 'w' }).annualRatePercent).toBeNull()
    expect(loanItemSchema.parse({ firstPaymentDate: 0, startDate: 0, walletId: 'w' }).annualRatePercent).toBeNull()
  })
})
