import type { Range } from '~~/utils/date/types'

import { describe, expect, it } from 'vitest'

import { availableGranularities } from './granularity'

const day = 24 * 60 * 60 * 1000
const start = 0

function rangeOfDays(days: number): Range {
  return { end: start + days * day, start }
}

describe('availableGranularities', () => {
  it('excludes day when period is day and dayDiff is at the 7-day boundary', () => {
    expect(availableGranularities('day', rangeOfDays(7))).not.toContain('day')
  })

  it('includes day once dayDiff passes the 7-day boundary while period is day', () => {
    expect(availableGranularities('day', rangeOfDays(8))).toContain('day')
  })

  it('always includes day when a non-day period is selected, regardless of dayDiff', () => {
    expect(availableGranularities('week', rangeOfDays(0))).toContain('day')
  })

  it('adds week at exactly the 7-day boundary', () => {
    expect(availableGranularities('week', rangeOfDays(7))).toContain('week')
    expect(availableGranularities('week', rangeOfDays(6))).not.toContain('week')
  })

  it('adds month at exactly the 30-day boundary', () => {
    expect(availableGranularities('month', rangeOfDays(30))).toContain('month')
    expect(availableGranularities('month', rangeOfDays(29))).not.toContain('month')
  })

  it('adds year at exactly the 400-day boundary', () => {
    expect(availableGranularities('year', rangeOfDays(400))).toContain('year')
    expect(availableGranularities('year', rangeOfDays(399))).not.toContain('year')
  })

  it('offers all four granularities once the range is at least 400 days', () => {
    expect(availableGranularities('year', rangeOfDays(400))).toEqual(['day', 'week', 'month', 'year'])
  })

  it('offers nothing when period is day and the range is short', () => {
    expect(availableGranularities('day', rangeOfDays(6))).toEqual([])
  })
})
