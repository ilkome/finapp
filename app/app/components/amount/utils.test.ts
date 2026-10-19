import { describe, expect, it } from 'vitest'

import { amountToMinor, formatAmount, minorToAmount } from '~/components/amount/utils'

describe('formatAmount', () => {
  it('formats minor units with space thousands and the fraction only when it is not zero', () => {
    expect(formatAmount(123450, 'USD')).toBe('1 234.50')
    expect(formatAmount(123400, 'USD')).toBe('1 234')
    expect(formatAmount(-5, 'USD')).toBe('-0.05')
    expect(formatAmount(0, 'USD')).toBe('0')
  })

  it('keeps every satoshi and whole units of zero-scale currencies', () => {
    expect(formatAmount(123456789, 'BTC')).toBe('1.23456789')
    expect(formatAmount(1500, 'JPY')).toBe('1 500')
  })

  it('follows the minor display', () => {
    expect(formatAmount(123400, 'USD', { minorDisplay: 'always' })).toBe('1 234.00')
    expect(formatAmount(123450, 'USD', { minorDisplay: 'never' })).toBe('1 235')
    expect(formatAmount(-40, 'USD', { minorDisplay: 'never' })).toBe('0')
  })

  it('rounds a fractional converted total', () => {
    expect(formatAmount(1234.6, 'USD')).toBe('12.35')
  })
})

describe('minor units', () => {
  it('converts by the currency scale', () => {
    expect(amountToMinor(12.34, 'USD')).toBe(1234)
    expect(amountToMinor(0.1, 'BTC')).toBe(10000000)
    expect(minorToAmount(1234, 'USD')).toBe(12.34)
    expect(minorToAmount(1500, 'JPY')).toBe(1500)
  })
})
