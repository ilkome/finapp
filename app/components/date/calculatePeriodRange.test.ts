import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { calculatePeriodRange } from '~/components/date/utils'
import type { RangePeriodDuration } from '~/components/date/types'

dayjs.locale({
  name: 'en',
  weekStart: 1,
})

describe('calculatePeriodRange', () => {
  it('should calculate range for 1 month period', () => {
    const params: RangePeriodDuration = {
      duration: 1,
      period: 'month',
      range: {
        end: dayjs('2024-03-15').valueOf(),
        start: dayjs('2024-03-01').valueOf(),
      },
    }

    const result = calculatePeriodRange(params)

    expect(result).toEqual({
      end: dayjs('2024-03-31').endOf('day').valueOf(),
      start: dayjs('2024-03-01').startOf('day').valueOf(),
    })
  })

  it('should calculate range for 3 months period', () => {
    const params: RangePeriodDuration = {
      duration: 3,
      period: 'month',
      range: {
        end: dayjs('2024-03-15').valueOf(),
        start: dayjs('2024-01-01').valueOf(),
      },
    }

    const result = calculatePeriodRange(params)

    expect(result).toEqual({
      end: dayjs('2024-03-31').endOf('day').valueOf(),
      start: dayjs('2024-01-01').startOf('day').valueOf(),
    })
  })

  it('should calculate range for 7 days period', () => {
    const params: RangePeriodDuration = {
      duration: 7,
      period: 'day',
      range: {
        end: dayjs('2024-03-15').valueOf(),
        start: dayjs('2024-03-09').valueOf(),
      },
    }

    const result = calculatePeriodRange(params)

    expect(result).toEqual({
      end: dayjs('2024-03-15').endOf('day').valueOf(),
      start: dayjs('2024-03-09').startOf('day').valueOf(),
    })
  })

  it('should calculate range for 1 year period', () => {
    const params: RangePeriodDuration = {
      duration: 1,
      period: 'year',
      range: {
        end: dayjs('2024-03-15').valueOf(),
        start: dayjs('2024-02-01').valueOf(),
      },
    }

    const result = calculatePeriodRange(params)

    expect(result).toEqual({
      end: dayjs('2024-12-31').endOf('day').valueOf(),
      start: dayjs('2024-01-01').valueOf(),
    })
  })

  // for 2 weeks
  it('should calculate range for 2 weeks period', () => {
    const params: RangePeriodDuration = {
      duration: 2,
      period: 'week',
      range: {
        end: dayjs('2024-11-15').valueOf(),
        start: dayjs('2024-11-15').valueOf(),
      },
    }

    const result = calculatePeriodRange(params)

    console.log(dayjs(result.end).format())
    console.log(dayjs(result.start).format())

    expect(result).toEqual({
      end: dayjs('2024-11-17').endOf('day').valueOf(),
      start: dayjs('2024-11-04').valueOf(),
    })
  })
})
