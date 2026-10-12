import { describe, expect, it } from 'vitest'

import { formatAmount } from '~/components/amount/utils'

describe('formatAmount', () => {
  it('formats with space thousands at the currency precision', () => {
    expect(formatAmount(1234.5, 'USD')).toBe('1 234.50')
  })

  it('shows significant digits when rounding would hide a non-zero value', () => {
    expect(formatAmount(0.004, undefined, { precision: 2 })).toBe('0.0040')
    expect(formatAmount(-0.004, undefined, { precision: 2 })).toBe('-0.0040')
  })

  it('keeps a value that rounds up to the last digit', () => {
    expect(formatAmount(0.005, undefined, { precision: 2 })).toBe('0.01')
    expect(formatAmount(0, undefined, { precision: 2 })).toBe('0.00')
  })
})
