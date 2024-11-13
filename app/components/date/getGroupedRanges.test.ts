import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { getPeriodsInRange } from './utils'
import type { RangePeriodDuration } from './types'

describe('date utils', () => {
  describe('getPeriodsInRange', () => {
    it('should return correct grouped ranges for months', () => {
      const params: RangePeriodDuration = {
        duration: 1,
        period: 'month',
        range: {
          end: dayjs('2024-03-01').valueOf(),
          start: dayjs('2024-01-01').valueOf(),
        },
      }

      const result = getPeriodsInRange(params)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
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
      const params: RangePeriodDuration = {
        duration: 1,
        period: 'month',
        range: {
          end: dayjs('2024-03-15').valueOf(),
          start: dayjs('2024-01-15').valueOf(),
        },
      }

      const result = getPeriodsInRange(params)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
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
  })
})
