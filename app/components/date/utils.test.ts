import { describe, expect, it } from 'vitest'

import { calculateBestIntervalsBy, getEndOf, getStartOf } from '~/components/date/utils'

describe('calculateBestIntervalsBy', () => {
  it('returns year for range > 400 days', () => {
    const range = { end: new Date(2025, 5, 1).getTime(), start: new Date(2024, 0, 1).getTime() }
    expect(calculateBestIntervalsBy(range)).toBe('year')
  })

  it('returns month at exactly 401 days', () => {
    const start = new Date(2024, 0, 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 401)
    expect(calculateBestIntervalsBy({ end: end.getTime(), start: start.getTime() })).toBe('year')
  })

  it('returns month for range 81–400 days', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(2025, 6, 1) // ~181 days
    expect(calculateBestIntervalsBy({ end: end.getTime(), start: start.getTime() })).toBe('month')
  })

  it('returns day for range <= 80 days', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(2025, 1, 15) // ~45 days
    expect(calculateBestIntervalsBy({ end: end.getTime(), start: start.getTime() })).toBe('day')
  })

  it('returns month at boundary 400 days', () => {
    const start = new Date(2024, 0, 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 400)
    expect(calculateBestIntervalsBy({ end: end.getTime(), start: start.getTime() })).toBe('month')
  })

  it('returns day at boundary 80 days', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 80)
    expect(calculateBestIntervalsBy({ end: end.getTime(), start: start.getTime() })).toBe('day')
  })
})

describe('getStartOf', () => {
  const date = new Date(2025, 2, 12, 15, 30) // Wed Mar 12 2025 15:30

  it('year → Jan 1 00:00', () => {
    expect(getStartOf(date, 'year')).toEqual(new Date(2025, 0, 1))
  })

  it('month → Mar 1 00:00', () => {
    expect(getStartOf(date, 'month')).toEqual(new Date(2025, 2, 1))
  })

  it('week → Monday (weekStartsOn: 1)', () => {
    expect(getStartOf(date, 'week')).toEqual(new Date(2025, 2, 10))
  })

  it('day → Mar 12 00:00', () => {
    expect(getStartOf(date, 'day')).toEqual(new Date(2025, 2, 12))
  })
})

describe('getEndOf', () => {
  const date = new Date(2025, 2, 12, 15, 30) // Wed Mar 12 2025 15:30

  it('year → Dec 31 23:59:59.999', () => {
    const result = getEndOf(date, 'year')
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(11)
    expect(result.getDate()).toBe(31)
    expect(result.getHours()).toBe(23)
  })

  it('month → Mar 31 23:59:59.999', () => {
    const result = getEndOf(date, 'month')
    expect(result.getDate()).toBe(31)
    expect(result.getHours()).toBe(23)
  })

  it('week → Sunday (weekStartsOn: 1)', () => {
    const result = getEndOf(date, 'week')
    expect(result.getDay()).toBe(0) // Sunday
    expect(result.getDate()).toBe(16)
  })

  it('day → Mar 12 23:59:59.999', () => {
    const result = getEndOf(date, 'day')
    expect(result.getDate()).toBe(12)
    expect(result.getHours()).toBe(23)
  })
})
