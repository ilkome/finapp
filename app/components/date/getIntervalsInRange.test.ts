import { describe, expect, it } from 'vitest'
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { getIntervalsInRange } from './utils'
import type { IntervalsInRangeProps } from './types'

describe('getIntervalsInRange', () => {
  it('should return correct grouped ranges for months', () => {
    const params: IntervalsInRangeProps = {
      intervalsBy: 'month',
      intervalsDuration: 1,
      range: {
        end: endOfMonth(new Date('2024-03-01')).getTime(),
        start: new Date('2024-01-01').getTime(),
      },
      rangeOffset: 0,
    }

    const result = getIntervalsInRange(params)

    expect(result).toHaveLength(3)
    expect(result.at(0)).toEqual({
      end: endOfMonth(new Date('2024-01-31')).getTime(),
      start: startOfMonth(new Date('2024-01-01')).getTime(),
    })
    expect(result[1]).toEqual({
      end: endOfMonth(new Date('2024-02-29')).getTime(),
      start: startOfMonth(new Date('2024-02-01')).getTime(),
    })
    expect(result[2]).toEqual({
      end: endOfMonth(new Date('2024-03-31')).getTime(),
      start: startOfMonth(new Date('2024-03-01')).getTime(),
    })
  })

  it('should handle partial ranges correctly', () => {
    const params: IntervalsInRangeProps = {
      intervalsBy: 'month',
      intervalsDuration: 1,
      range: {
        end: endOfMonth(new Date('2024-03-15')).getTime(),
        start: startOfMonth(new Date('2024-01-15')).getTime(),
      },
      rangeOffset: 0,
    }

    const result = getIntervalsInRange(params)

    expect(result).toHaveLength(3)
    expect(result.at(0)).toEqual({
      end: endOfMonth(new Date('2024-01-31')).getTime(),
      start: startOfMonth(new Date('2024-01-01')).getTime(),
    })
    expect(result[1]).toEqual({
      end: endOfMonth(new Date('2024-02-29')).getTime(),
      start: startOfMonth(new Date('2024-02-01')).getTime(),
    })
    expect(result[2]).toEqual({
      end: endOfMonth(new Date('2024-03-31')).getTime(),
      start: startOfMonth(new Date('2024-03-01')).getTime(),
    })
  })

  it('should calculate range for 3 months period with intervals by 1 week', () => {
    const params: IntervalsInRangeProps = {
      intervalsBy: 'week',
      intervalsDuration: 1,
      range: {
        end: new Date('2024-04-30').getTime(),
        start: new Date('2024-02-01').getTime(),
      },
      rangeOffset: 0,
    }

    const result = getIntervalsInRange(params)

    expect(result).toHaveLength(14)
    expect(result.at(0)).toEqual({
      end: endOfDay(new Date('2024-02-04')).getTime(),
      start: startOfDay(new Date('2024-02-01')).getTime(),
    })

    expect(result.at(-1)).toEqual({
      end: endOfDay(new Date('2024-04-30')).getTime(),
      start: startOfDay(new Date('2024-04-29')).getTime(),
    })
  })
})
