import { describe, expect, it } from 'vitest'
import { getEndOf, getStartOf } from '~~/utils/date/period'

import type { StatDateParams } from '~/components/stat/date/types'

import { getPreviousPeriodsRange } from './averageWindow'

const now = new Date('2024-06-15T12:00:00Z')

describe('getPreviousPeriodsRange', () => {
  it('count=1, rangeBy=month: the single previous month', () => {
    const params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'> = { rangeBy: 'month', rangeDuration: 1 }
    const may = new Date('2024-05-15T12:00:00Z')
    const range = getPreviousPeriodsRange(params, 1, now)
    expect(range.end).toBe(getEndOf(may, 'month').getTime())
    expect(range.start).toBe(getStartOf(may, 'month').getTime())
  })

  it('count=3, rangeBy=month: three months before the current one, not four', () => {
    const params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'> = { rangeBy: 'month', rangeDuration: 1 }
    const range = getPreviousPeriodsRange(params, 3, now)
    expect(range.end).toBe(getEndOf(new Date('2024-05-15T12:00:00Z'), 'month').getTime())
    expect(range.start).toBe(getStartOf(new Date('2024-03-15T12:00:00Z'), 'month').getTime())
  })

  it('count=1, rangeBy=day: the single previous day', () => {
    const params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'> = { rangeBy: 'day', rangeDuration: 1 }
    const range = getPreviousPeriodsRange(params, 1, now)
    const yesterday = new Date('2024-06-14T12:00:00Z')
    expect(range.end).toBe(getEndOf(yesterday, 'day').getTime())
    expect(range.start).toBe(getStartOf(yesterday, 'day').getTime())
  })

  it('count=7, rangeBy=day: seven days before today, not eight', () => {
    const params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'> = { rangeBy: 'day', rangeDuration: 1 }
    const range = getPreviousPeriodsRange(params, 7, now)
    expect(range.end).toBe(getEndOf(new Date('2024-06-14T12:00:00Z'), 'day').getTime())
    expect(range.start).toBe(getStartOf(new Date('2024-06-08T12:00:00Z'), 'day').getTime())
  })

  it('count=1, rangeBy=year: the single previous year', () => {
    const params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'> = { rangeBy: 'year', rangeDuration: 1 }
    const range = getPreviousPeriodsRange(params, 1, now)
    const lastYear = new Date('2023-06-15T12:00:00Z')
    expect(range.end).toBe(getEndOf(lastYear, 'year').getTime())
    expect(range.start).toBe(getStartOf(lastYear, 'year').getTime())
  })

  it('rangeDuration > 1 multiplies the window (e.g. quarter-length ranges)', () => {
    const params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'> = { rangeBy: 'month', rangeDuration: 3 }
    const range = getPreviousPeriodsRange(params, 2, now)
    // untilDate = end of (now - 3 months) = end of March 2024
    // start = start of (untilDate - (3*2 - 1 = 5) months) = start of October 2023
    expect(range.end).toBe(getEndOf(new Date('2024-03-15T12:00:00Z'), 'month').getTime())
    expect(range.start).toBe(getStartOf(new Date('2023-10-15T12:00:00Z'), 'month').getTime())
  })
})
