import { describe, expect, it } from 'vitest'

import type { IntervalsInRangeProps } from '~/components/date/types'

import { getEndOf, getIntervalsInRange, getStartOf } from '~/components/date/utils'

// Civil-day model: boundaries are computed in UTC (see plans/civil-date-migration.md).
const monthStart = (y: number, m: number) => Date.UTC(y, m, 1)
const monthEnd = (y: number, m: number) => Date.UTC(y, m + 1, 1) - 1
const dayStart = (y: number, m: number, d: number) => Date.UTC(y, m, d)
const dayEnd = (y: number, m: number, d: number) => Date.UTC(y, m, d + 1) - 1

describe('getIntervalsInRange', () => {
  it('should return correct grouped ranges for months', () => {
    const params: IntervalsInRangeProps = {
      intervalsBy: 'month',
      intervalsDuration: 1,
      range: { end: monthEnd(2024, 2), start: monthStart(2024, 0) },
      rangeOffset: 0,
    }

    const result = getIntervalsInRange(params)

    expect(result).toHaveLength(3)
    expect(result.at(0)).toEqual({ end: monthEnd(2024, 0), start: monthStart(2024, 0) })
    expect(result[1]).toEqual({ end: monthEnd(2024, 1), start: monthStart(2024, 1) })
    expect(result[2]).toEqual({ end: monthEnd(2024, 2), start: monthStart(2024, 2) })
  })

  it('should handle partial ranges correctly', () => {
    const params: IntervalsInRangeProps = {
      intervalsBy: 'month',
      intervalsDuration: 1,
      range: { end: monthEnd(2024, 2), start: monthStart(2024, 0) },
      rangeOffset: 0,
    }

    const result = getIntervalsInRange(params)

    expect(result).toHaveLength(3)
    expect(result.at(0)).toEqual({ end: monthEnd(2024, 0), start: monthStart(2024, 0) })
    expect(result[1]).toEqual({ end: monthEnd(2024, 1), start: monthStart(2024, 1) })
    expect(result[2]).toEqual({ end: monthEnd(2024, 2), start: monthStart(2024, 2) })
  })

  it('should calculate range for 3 months period with intervals by 1 week', () => {
    const params: IntervalsInRangeProps = {
      intervalsBy: 'week',
      intervalsDuration: 1,
      range: { end: dayStart(2024, 3, 30), start: dayStart(2024, 1, 1) },
      rangeOffset: 0,
    }

    const result = getIntervalsInRange(params)

    expect(result).toHaveLength(14)
    // First interval clamped to range.start (2024-02-01 is a Thursday; week ends Sun 02-04).
    expect(result.at(0)).toEqual({ end: dayEnd(2024, 1, 4), start: dayStart(2024, 1, 1) })
    // Last interval clamped to range.end (2024-04-30).
    expect(result.at(-1)).toEqual({
      end: getEndOf(new Date(dayStart(2024, 3, 30)), 'day').getTime(),
      start: getStartOf(new Date(dayStart(2024, 3, 30)), 'week').getTime(),
    })
  })
})
