import { describe, expect, it } from 'vitest'

import type { IntervalsInRangeProps, Range } from '~/components/date/types'

import { calculateIntervalInRange, getEndOf, getStartOf } from '~/components/date/utils'

// Civil-day model: boundaries are computed in UTC (see plans/civil-date-migration.md),
// so expectations use Date.UTC, not local-time date-fns helpers.
const endOfDayUTC = (y: number, m: number, d: number) => Date.UTC(y, m, d + 1) - 1

describe('calculateIntervalInRange', () => {
  describe('fixed dates (utc civil days)', () => {
    it('should calculate range for 1 month period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 1,
        range: { end: Date.UTC(2024, 2, 15), start: Date.UTC(2024, 2, 1) },
        rangeOffset: 0,
      }

      expect(calculateIntervalInRange(params)).toEqual({
        end: Date.UTC(2024, 3, 1) - 1,
        start: Date.UTC(2024, 2, 1),
      })
    })

    it('should calculate range for 3 months period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 3,
        range: { end: Date.UTC(2024, 2, 15), start: Date.UTC(2024, 0, 1) },
        rangeOffset: 0,
      }

      expect(calculateIntervalInRange(params)).toEqual({
        end: Date.UTC(2024, 3, 1) - 1,
        start: Date.UTC(2024, 0, 1),
      })
    })

    it('should calculate range for 7 days period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'day',
        intervalsDuration: 7,
        range: { end: Date.UTC(2024, 2, 15), start: Date.UTC(2024, 2, 9) },
        rangeOffset: 0,
      }

      expect(calculateIntervalInRange(params)).toEqual({
        end: endOfDayUTC(2024, 2, 15),
        start: Date.UTC(2024, 2, 9),
      })
    })

    it('should calculate range for 1 year period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'year',
        intervalsDuration: 1,
        range: { end: Date.UTC(2024, 2, 15), start: Date.UTC(2024, 1, 1) },
        rangeOffset: 0,
      }

      expect(calculateIntervalInRange(params)).toEqual({
        end: Date.UTC(2025, 0, 1) - 1,
        start: Date.UTC(2024, 0, 1),
      })
    })

    it('should calculate range for 2 weeks period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 2,
        range: { end: Date.UTC(2024, 10, 15), start: Date.UTC(2024, 10, 8) },
        rangeOffset: 0,
      }

      // 2024-11-15 is a Friday; Monday-based weeks -> 11-04 .. 11-17.
      expect(calculateIntervalInRange(params)).toEqual({
        end: endOfDayUTC(2024, 10, 17),
        start: Date.UTC(2024, 10, 4),
      })
    })
  })

  describe('from today dates', () => {
    const now = Date.now()
    const range: Range = { end: now, start: now }

    it('should calculate range for this month', () => {
      const result = calculateIntervalInRange({ intervalsBy: 'month', intervalsDuration: 1, range, rangeOffset: 0 })
      expect(result).toEqual({
        end: getEndOf(new Date(now), 'month').getTime(),
        start: getStartOf(new Date(now), 'month').getTime(),
      })
    })

    it('should calculate range for this week', () => {
      const result = calculateIntervalInRange({ intervalsBy: 'week', intervalsDuration: 1, range, rangeOffset: 0 })
      expect(result).toEqual({
        end: getEndOf(new Date(now), 'week').getTime(),
        start: getStartOf(new Date(now), 'week').getTime(),
      })
    })

    it('should calculate range last week', () => {
      const result = calculateIntervalInRange({ intervalsBy: 'week', intervalsDuration: 1, range, rangeOffset: 1 })
      const lastWeek = new Date(getStartOf(new Date(now), 'week').getTime() - 7 * 86_400_000)
      expect(result).toEqual({
        end: getEndOf(lastWeek, 'week').getTime(),
        start: getStartOf(lastWeek, 'week').getTime(),
      })
    })
  })
})
