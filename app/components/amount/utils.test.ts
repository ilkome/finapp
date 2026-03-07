import { describe, expect, it } from 'vitest'

import { formatAmount, formatByCurrency, getCurrencySymbol } from '~/components/amount/utils'

describe('formatAmount', () => {
  it('formats integer with default precision 0', () => {
    expect(formatAmount(1234)).toBe('1 234')
  })

  it('uses space as thousands separator', () => {
    expect(formatAmount(1000000)).toBe('1 000 000')
  })

  it('formats with explicit precision', () => {
    expect(formatAmount(1234.567, undefined, { precision: 2 })).toBe('1 234.57')
  })

  it('formats negative amounts', () => {
    expect(formatAmount(-1500)).toBe('-1 500')
  })

  it('formats zero', () => {
    expect(formatAmount(0)).toBe('0')
  })

  it('formats small decimals', () => {
    expect(formatAmount(0.99, undefined, { precision: 2 })).toBe('0.99')
  })
})

describe('getCurrencySymbol', () => {
  it('returns symbol for known currency', () => {
    expect(getCurrencySymbol('USD')).toBe('$')
    expect(getCurrencySymbol('EUR')).toBe('€')
    expect(getCurrencySymbol('RUB')).toBe('₽')
  })

  it('returns code when no symbol defined', () => {
    expect(getCurrencySymbol('AMD')).toBe('AMD')
  })

  it('returns empty string for undefined', () => {
    expect(getCurrencySymbol(undefined)).toBe('')
  })
})

describe('formatByCurrency', () => {
  it('adds thousands separator', () => {
    expect(formatByCurrency('1000000', ' ')).toBe('1 000 000')
  })

  it('does not affect small numbers', () => {
    expect(formatByCurrency('999', ' ')).toBe('999')
  })

  it('works with different separators', () => {
    expect(formatByCurrency('1000000', ',')).toBe('1,000,000')
  })
})
