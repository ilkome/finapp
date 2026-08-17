import { describe, expect, it } from 'vitest'
import { epochToCivilParts, toCivilDayEpoch, todayCivilDayEpoch } from '~~/utils/date/civil'

import { formatChartAmount, formatChartAxisLabel, formatChartTooltipLabel, getTooltipFormatForChart } from '~/components/stat/chart/format'

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

describe('formatChartAxisLabel', () => {
  it('adds the year when a sub-year axis crosses into a new year', () => {
    const december = toCivilDayEpoch(2025, 11, 1)
    const january = toCivilDayEpoch(2026, 0, 1)

    expect(formatChartAxisLabel(january, december, 'month', 'ru')).toBe('2026\nянв.')
  })

  it('keeps ordinary labels compact within the same year', () => {
    const january = toCivilDayEpoch(2026, 0, 1)
    const february = toCivilDayEpoch(2026, 1, 1)

    expect(formatChartAxisLabel(february, january, 'month', 'ru')).toBe('фев.')
  })

  it('does not duplicate the year on a yearly axis', () => {
    const previousYear = toCivilDayEpoch(2025, 0, 1)
    const currentYear = toCivilDayEpoch(2026, 0, 1)

    expect(formatChartAxisLabel(currentYear, previousYear, 'year', 'ru')).toBe('2026')
  })
})

describe('getTooltipFormatForChart', () => {
  it('uses the full standalone month for monthly buckets', () => {
    expect(getTooltipFormatForChart('month')).toBe('LLLL')
  })

  it('keeps the existing format for other granularities', () => {
    expect(getTooltipFormatForChart('day')).toBe('d MMM')
    expect(getTooltipFormatForChart('year')).toBe('yyyy')
  })
})

describe('formatChartTooltipLabel', () => {
  const currentYear = epochToCivilParts(todayCivilDayEpoch()).year

  it('omits the current year from sub-year periods', () => {
    expect(formatChartTooltipLabel(toCivilDayEpoch(currentYear, 7, 17), 'day', 'en')).toBe('17 Aug')
    expect(formatChartTooltipLabel(toCivilDayEpoch(currentYear, 7, 1), 'month', 'en')).toBe('August')
  })

  it('shows the year for sub-year periods outside the current year', () => {
    expect(formatChartTooltipLabel(toCivilDayEpoch(currentYear - 1, 7, 17), 'day', 'en')).toBe(`17 Aug ${currentYear - 1}`)
    expect(formatChartTooltipLabel(toCivilDayEpoch(currentYear - 1, 7, 1), 'month', 'en')).toBe(`August ${currentYear - 1}`)
  })
})
