import { describe, expect, it } from 'vitest'

import { calculateBestIntervalsBy } from '~/components/date/utils'

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
