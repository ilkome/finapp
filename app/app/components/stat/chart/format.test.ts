import { describe, expect, it } from 'vitest'

import { formatChartAmount } from '~/components/stat/chart/format'

describe('formatChartAmount', () => {
  it('formats non-finite echarts empty-datapoint values as 0', () => {
    expect(formatChartAmount(undefined)).toBe('0')
    expect(formatChartAmount(Number.NaN)).toBe('0')
    expect(formatChartAmount('-')).toBe('0')
  })

  it('formats a numeric string as its value', () => {
    expect(formatChartAmount('5')).toBe('5')
  })

  it('formats a normal number unchanged', () => {
    const expected = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(1234)
    expect(formatChartAmount(1234, 'ru-RU')).toBe(expected)
  })
})
