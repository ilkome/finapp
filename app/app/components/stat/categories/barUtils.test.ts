import { describe, expect, it } from 'vitest'

import { computeBarStyle, formatCompactAmount } from '~/components/stat/categories/barUtils'

describe('computeBarStyle', () => {
  const biggest = { expense: 500, income: 1000 }

  it('returns undefined for zero value', () => {
    expect(computeBarStyle(0, 'red', biggest, 'width')).toBeUndefined()
  })

  it('computes width for positive (income) value', () => {
    const result = computeBarStyle(500, 'green', biggest, 'width')
    expect(result).toEqual({ backgroundColor: 'green', width: '50%' })
  })

  it('computes height for negative (expense) value', () => {
    const result = computeBarStyle(-250, 'red', biggest, 'height')
    expect(result).toEqual({ backgroundColor: 'red', height: '50%' })
  })

  it('computes 100% for value equal to reference', () => {
    const result = computeBarStyle(1000, 'blue', biggest, 'width')
    expect(result).toEqual({ backgroundColor: 'blue', width: '100%' })
  })

  it('handles undefined color', () => {
    const result = computeBarStyle(500, undefined, biggest, 'width')
    expect(result).toEqual({ backgroundColor: undefined, width: '50%' })
  })
})

describe('formatCompactAmount', () => {
  it('formats millions', () => {
    expect(formatCompactAmount(1500000)).toBe('1.50M')
    expect(formatCompactAmount(-2300000)).toBe('-2.30M')
  })

  it('formats tens of thousands', () => {
    expect(formatCompactAmount(15000)).toBe('15K')
    expect(formatCompactAmount(-42000)).toBe('-42K')
  })

  it('formats thousands with decimal', () => {
    expect(formatCompactAmount(1500)).toBe('1.5K')
    expect(formatCompactAmount(-5600)).toBe('-5.6K')
  })

  it('formats small numbers as integers', () => {
    expect(formatCompactAmount(999)).toBe('999')
    expect(formatCompactAmount(42)).toBe('42')
    expect(formatCompactAmount(-100)).toBe('-100')
  })

  it('formats zero', () => {
    expect(formatCompactAmount(0)).toBe('0')
  })
})
