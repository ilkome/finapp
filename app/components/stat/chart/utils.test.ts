import { describe, expect, it } from 'vitest'

import { getCompactAmount, getLocalAmount, markArea } from './utils'

describe('stat chart utils', () => {
  describe('markArea', () => {
    it('returns echarts markArea config for given value', () => {
      const result = markArea(3)
      expect(result.data).toEqual([[{ xAxis: '3' }, { xAxis: '3' }]])
      expect(result.itemStyle.color).toBe('var(--chart-line)')
      expect(result.itemStyle.opacity).toBe(1)
    })

    it('converts numeric value to string for xAxis', () => {
      expect(markArea(0).data[0][0].xAxis).toBe('0')
      expect(markArea(-1).data[0][0].xAxis).toBe('-1')
    })
  })

  describe('getCompactAmount', () => {
    it('formats small numbers as-is', () => {
      expect(getCompactAmount(0)).toBe('0')
      expect(getCompactAmount(100)).toBe('100')
      expect(getCompactAmount(999)).toBe('999')
    })

    it('formats thousands with K', () => {
      expect(getCompactAmount(1000)).toBe('1K')
      expect(getCompactAmount(1500)).toBe('1.5K')
      expect(getCompactAmount(10000)).toBe('10K')
    })

    it('formats millions with M', () => {
      expect(getCompactAmount(1000000)).toBe('1M')
      expect(getCompactAmount(2500000)).toBe('2.5M')
    })

    it('formats billions with B', () => {
      expect(getCompactAmount(1000000000)).toBe('1B')
    })
  })

  describe('getLocalAmount', () => {
    it('formats with Russian locale (space as separator)', () => {
      const result = getLocalAmount(1000000)
      // Russian locale uses non-breaking space as thousand separator
      expect(result.replace(/\s/g, ' ')).toBe('1 000 000')
    })

    it('formats without decimal places', () => {
      expect(getLocalAmount(42)).toBe('42')
      // Should round, not show decimals
      const result = getLocalAmount(1234.56)
      expect(result.replace(/\s/g, ' ')).toBe('1 235')
    })
  })
})
