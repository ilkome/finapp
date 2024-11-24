import { describe, expect, it } from 'vitest'
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subWeeks } from 'date-fns'
import { calculateIntervalInRange } from '~/components/date/utils'
import type { IntervalsInRangeProps, Range } from '~/components/date/types'

describe('calculateIntervalInRange', () => {
  describe('fixed dates', () => {
    it('should calculate range for 1 month period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 1,
        range: {
          end: new Date('2024-03-15').getTime(),
          start: new Date('2024-03-01').getTime(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: endOfDay(new Date('2024-03-31')).getTime(),
        start: startOfDay(new Date('2024-03-01')).getTime(),
      })
    })

    it('should calculate range for 3 months period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 3,
        range: {
          end: new Date('2024-03-15').getTime(),
          start: new Date('2024-01-01').getTime(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: endOfDay(new Date('2024-03-31')).getTime(),
        start: startOfDay(new Date('2024-01-01')).getTime(),
      })
    })

    it('should calculate range for 7 days period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'day',
        intervalsDuration: 7,
        range: {
          end: new Date('2024-03-15').getTime(),
          start: new Date('2024-03-09').getTime(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: endOfDay(new Date('2024-03-15')).getTime(),
        start: startOfDay(new Date('2024-03-09')).getTime(),
      })
    })

    it('should calculate range for 1 year period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'year',
        intervalsDuration: 1,
        range: {
          end: new Date('2024-03-15').getTime(),
          start: new Date('2024-02-01').getTime(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: endOfDay(new Date('2024-12-31')).getTime(),
        start: startOfDay(new Date('2024-01-01')).getTime(),
      })
    })

    it('should calculate range for 2 weeks period', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 2,
        range: {
          end: new Date('2024-11-15').getTime(),
          start: new Date('2024-11-08').getTime(),
        },
        rangeOffset: 0,
      }

      const result = calculateIntervalInRange(params)

      expect(result).toEqual({
        end: endOfDay(new Date('2024-11-17')).getTime(),
        start: startOfDay(new Date('2024-11-04')).getTime(),
      })
    })
  })

  describe('from today dates', () => {
    const range: Range = {
      end: new Date().getTime(),
      start: new Date().getTime(),
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
        end: endOfMonth(new Date()).getTime(),
        start: startOfMonth(new Date()).getTime(),
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
        end: endOfWeek(new Date(), { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(new Date(), { weekStartsOn: 1 }).getTime(),
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
        end: endOfWeek(new Date(), { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }).getTime(),
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
        end: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }).getTime(),
        start: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }).getTime(),
      })
    })
  })
})
