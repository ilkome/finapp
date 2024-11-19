import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { getIntervalsInRange } from './utils'
import type { IntervalsInRangeProps } from './types'

dayjs.locale({
  name: 'en',
  weekStart: 1,
})

describe('date utils', () => {
  describe('getIntervalsInRange', () => {
    it('should return correct grouped ranges for months', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 1,
        range: {
          end: dayjs('2024-03-01').endOf('month').valueOf(),
          start: dayjs('2024-01-01').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = getIntervalsInRange(params)

      expect(result).toHaveLength(3)
      expect(result.at(0)).toEqual({
        end: dayjs('2024-01-31').endOf('month').valueOf(),
        start: dayjs('2024-01-01').startOf('month').valueOf(),
      })
      expect(result[1]).toEqual({
        end: dayjs('2024-02-29').endOf('month').valueOf(),
        start: dayjs('2024-02-01').startOf('month').valueOf(),
      })
      expect(result[2]).toEqual({
        end: dayjs('2024-03-31').endOf('month').valueOf(),
        start: dayjs('2024-03-01').startOf('month').valueOf(),
      })
    })

    it('should handle partial ranges correctly', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'month',
        intervalsDuration: 1,
        range: {
          end: dayjs('2024-03-15').endOf('month').valueOf(),
          start: dayjs('2024-01-15').startOf('month').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = getIntervalsInRange(params)

      expect(result).toHaveLength(3)
      expect(result.at(0)).toEqual({
        end: dayjs('2024-01-31').endOf('month').valueOf(),
        start: dayjs('2024-01-01').valueOf(),
      })
      expect(result[1]).toEqual({
        end: dayjs('2024-02-29').endOf('month').valueOf(),
        start: dayjs('2024-02-01').valueOf(),
      })
      expect(result[2]).toEqual({
        end: dayjs('2024-03-31').endOf('month').valueOf(),
        start: dayjs('2024-03-01').valueOf(),
      })
    })

    it('should calculate range for 3 months period with intervals by 1 week', () => {
      const params: IntervalsInRangeProps = {
        intervalsBy: 'week',
        intervalsDuration: 1,
        range: {
          end: dayjs('2024-04-30').valueOf(),
          start: dayjs('2024-02-01').valueOf(),
        },
        rangeOffset: 0,
      }

      const result = getIntervalsInRange(params)

      expect(result).toHaveLength(14)
      expect(result.at(0)).toEqual({
        end: dayjs('2024-02-04').endOf('day').valueOf(),
        start: dayjs('2024-02-01').valueOf(),
      })

      expect(result.at(-1)).toEqual({
        end: dayjs('2024-04-30').endOf('day').valueOf(),
        start: dayjs('2024-04-29').valueOf(),
      })
    })
  })
})
