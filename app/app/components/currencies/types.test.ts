import { describe, expect, it } from 'vitest'

import { validateCurrency } from '~/components/currencies/types'

const custom = { code: 'PTS', manualRate: 2, manualRateCurrencyCode: 'RUB', scale: 0 }

describe('validateCurrency', () => {
  it('accepts a custom currency and a built-in edit', () => {
    expect(validateCurrency(custom, true)).toBeNull()
    expect(validateCurrency({ code: 'RUB', minorDisplay: 'never' }, false)).toBeNull()
  })

  it('mirrors the check constraints', () => {
    expect(validateCurrency({ ...custom, code: 'p' }, true)).toBe('code')
    expect(validateCurrency({ ...custom, code: 'USD' }, true)).toBe('builtInCode')
    expect(validateCurrency({ ...custom, scale: 10 }, true)).toBe('scale')
    expect(validateCurrency({ ...custom, scale: undefined }, true)).toBe('scale')
    expect(validateCurrency({ ...custom, manualRate: 0 }, true)).toBe('rate')
    expect(validateCurrency({ ...custom, manualRateCurrencyCode: undefined }, true)).toBe('rate')
    expect(validateCurrency({ ...custom, manualRateCurrencyCode: 'PTS' }, true)).toBe('rate')
    expect(validateCurrency({ code: 'PTS', scale: 0 }, true)).toBe('rateRequired')
  })
})
