import { describe, expect, it } from 'vitest'

import { normalizeAmountText, parseAmountInput } from './parseInput'

describe('parseAmountInput', () => {
  it.each([
    ['130,5', 130.5],
    ['130.5', 130.5],
    ['1 000,50', 1000.5],
    ['1 000,50', 1000.5],
    ['1,000.50', 1000.5],
    ['1.000,50', 1000.5],
    ['1.000.000', 1_000_000],
    ['1,000,000', 1_000_000],
    ['1\'000.5', 1000.5],
    ['-125,05', -125.05],
    ['0,', 0],
  ])('%s -> %s', (text, value) => {
    expect(parseAmountInput(text)).toBe(value)
  })

  it('is undefined for blank or unreadable text', () => {
    expect(parseAmountInput('')).toBeUndefined()
    expect(parseAmountInput('  ')).toBeUndefined()
    expect(parseAmountInput('abc')).toBeUndefined()
  })

  it('keeps a trailing decimal point while the user types', () => {
    expect(normalizeAmountText('130,')).toBe('130.')
  })
})
