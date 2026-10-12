import { describe, expect, it } from 'vitest'

import { loanIdFor, loanItemSchema, loanScheduleRowIdFor } from '~/components/loans/types'

describe('loanIdFor', () => {
  it('is deterministic per wallet', () => {
    expect(loanIdFor('wallet-1')).toBe(loanIdFor('wallet-1'))
    expect(loanIdFor('wallet-1')).not.toBe(loanIdFor('wallet-2'))
  })
})

describe('loanScheduleRowIdFor', () => {
  it('is deterministic per loan and payment number', () => {
    expect(loanScheduleRowIdFor('loan-1', 3)).toBe(loanScheduleRowIdFor('loan-1', 3))
    expect(loanScheduleRowIdFor('loan-1', 3)).not.toBe(loanScheduleRowIdFor('loan-1', 4))
    expect(loanScheduleRowIdFor('loan-1', 3)).not.toBe(loanScheduleRowIdFor('loan-2', 3))
  })
})

describe('loanItemSchema', () => {
  it('keeps a pre-nullable numeric rate and reads a missing or null rate as unknown', () => {
    expect(loanItemSchema.parse({ annualRate: 0, walletId: 'w' }).annualRate).toBe(0)
    expect(loanItemSchema.parse({ annualRate: 24.5, walletId: 'w' }).annualRate).toBe(24.5)
    expect(loanItemSchema.parse({ annualRate: null, walletId: 'w' }).annualRate).toBeNull()
    expect(loanItemSchema.parse({ walletId: 'w' }).annualRate).toBeNull()
  })
})
