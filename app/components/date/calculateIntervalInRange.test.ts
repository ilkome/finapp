import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { calculateIntervalInRange } from '~/components/date/utils'
import type { IntervalsInRangeProps, Range } from '~/components/date/types'

// @ts-expect-error works for tests
dayjs.locale({
  name: 'en',
  weekStart: 1,
})

describe('calculateIntervalInRange', () => {
  describe('fixed dates', () => {
    it('should calculate range for 1 month period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 1,
        range: {
          end: dayjs('2024-03-15').valueOf(),
          start: dayjs('2024-03-01').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs('2024-03-31').endOf('day').valueOf(),
        start: dayjs('2024-03-01').startOf('day').valueOf(),
      })
    })

    it('should calculate range for 3 months period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 3,
        range: {
          end: dayjs('2024-03-15').valueOf(),
          start: dayjs('2024-01-01').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs('2024-03-31').endOf('day').valueOf(),
        start: dayjs('2024-01-01').startOf('day').valueOf(),
      })
    })

    it('should calculate range for 7 days period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'day',
        intervalsDuration: 7,
        range: {
          end: dayjs('2024-03-15').valueOf(),
          start: dayjs('2024-03-09').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs('2024-03-15').endOf('day').valueOf(),
        start: dayjs('2024-03-09').startOf('day').valueOf(),
      })
    })

    it('should calculate range for 1 year period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'year',
        intervalsDuration: 1,
        range: {
          end: dayjs('2024-03-15').valueOf(),
          start: dayjs('2024-02-01').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs('2024-12-31').endOf('day').valueOf(),
        start: dayjs('2024-01-01').valueOf(),
      })
    })

    // for 2 weeks
    it('should calculate range for 2 weeks period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 2,
        range: {
          end: dayjs('2024-11-15').valueOf(),
          start: dayjs('2024-11-15').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs('2024-11-17').endOf('day').valueOf(),
        start: dayjs('2024-11-04').valueOf(),
      })
    })
  })

  describe('from today dates', () => {
    const range: Range = {
      end: dayjs().valueOf(),
      start: dayjs().valueOf(),
    }

    it('should calculate range for this month', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 1,
        range,
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs().endOf('month').valueOf(),
        start: dayjs().startOf('month').valueOf(),
      })
    })

    it('should calculate range for this week', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 1,
        range,
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs().endOf('week').valueOf(),
        start: dayjs().startOf('week').valueOf(),
      })
    })

    it('should calculate range for 2 weeks', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 2,
        range,
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs().endOf('week').valueOf(),
        start: dayjs().subtract(1, 'week').startOf('week').valueOf(),
      })
    })

    it('should calculate range last week', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 1,
        range,
        rangeOffset: 1,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: dayjs().subtract(1, 'week').endOf('week').valueOf(),
        start: dayjs().subtract(1, 'week').startOf('week').valueOf(),
      })
    })
  })
})
