import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { calculateRangeByToday } from '~/components/date/utils'
import type { CalculateRangeParams } from '~/components/date/types'

dayjs.locale({
  name: 'en',
  weekStart: 1,
})

describe('calculateIntervalInRange', () => {
  it('should calculate range for this month', () => {
    const params: CalculateRangeParams = {
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    }

    const result = calculateRangeByToday(params)

    expect(result).toEqual({
      end: dayjs().endOf('month').valueOf(),
      start: dayjs().startOf('month').valueOf(),
    })
  })

  it('should calculate range for this week', () => {
    const params: CalculateRangeParams = {
      rangeBy: 'week',
      rangeDuration: 1,
      rangeOffset: 0,
    }

    const result = calculateRangeByToday(params)

    expect(result).toEqual({
      end: dayjs().endOf('week').valueOf(),
      start: dayjs().startOf('week').valueOf(),
    })
  })

  it('should calculate range for 2 weeks', () => {
    const params: CalculateRangeParams = {
      rangeBy: 'week',
      rangeDuration: 2,
      rangeOffset: 0,
    }

    const result = calculateRangeByToday(params)

    expect(result).toEqual({
      end: dayjs().endOf('week').valueOf(),
      start: dayjs().subtract(1, 'week').startOf('week').valueOf(),
    })
  })

  it('should calculate range last week', () => {
    const params: CalculateRangeParams = {
      rangeBy: 'week',
      rangeDuration: 1,
      rangeOffset: 1,
    }

    const result = calculateRangeByToday(params)

    expect(result).toEqual({
      end: dayjs().subtract(1, 'week').endOf('week').valueOf(),
      start: dayjs().subtract(1, 'week').startOf('week').valueOf(),
    })
  })
})
