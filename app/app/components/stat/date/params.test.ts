import type { Range } from '~~/utils/date/types'

import { describe, expect, it } from 'vitest'

import type { StatDateParams } from '~/components/stat/date/types'

import { calculateBestGranularityBy, computeDateRange, defaultStatDateParams, getIntervalsInRange, normalizeStoredStatDateParams, parseStatDateQueryParams } from './params'

describe('parseStatDateQueryParams', () => {
  const base: StatDateParams = { ...defaultStatDateParams }

  it('returns current params on invalid query', () => {
    const result = parseStatDateQueryParams({ rangeBy: 'invalid' as any }, base)
    expect(result).toEqual(base)
  })

  it('merges valid rangeBy and rangeDuration', () => {
    const result = parseStatDateQueryParams({ rangeBy: 'month', rangeDuration: '3' }, base)
    expect(result.rangeBy).toBe('month')
    expect(result.rangeDuration).toBe(3)
    expect(result.granularityBy).toBe(base.granularityBy)
  })

  it('parses a transaction date as a custom day range', () => {
    const date = Date.UTC(2026, 7, 19)
    const result = parseStatDateQueryParams({ customDate: `${date}` }, base)

    expect(result.customDate).toEqual({
      end: Date.UTC(2026, 7, 19, 23, 59, 59, 999),
      start: date,
    })
  })

  it('merges granularityBy and granularityDuration', () => {
    const result = parseStatDateQueryParams({ granularityBy: 'week', granularityDuration: '2' }, base)
    expect(result.granularityBy).toBe('week')
    expect(result.granularityDuration).toBe(2)
  })

  it('merges intervalSelected', () => {
    const result = parseStatDateQueryParams({ intervalSelected: '5' }, base)
    expect(result.intervalSelected).toBe(5)
  })

  it('merges rangeOffset', () => {
    const result = parseStatDateQueryParams({ rangeOffset: '-2' }, base)
    expect(result.rangeOffset).toBe(-2)
  })

  it('merges rangePanOffset', () => {
    const result = parseStatDateQueryParams({ rangePanOffset: '3' }, base)
    expect(result.rangePanOffset).toBe(3)
  })

  it('merges boolean isShowMaxRange', () => {
    const result = parseStatDateQueryParams({ isShowMaxRange: 'true' }, base)
    expect(result.isShowMaxRange).toBe(true)
  })

  it('merges boolean isSkipEmpty', () => {
    const result = parseStatDateQueryParams({ isSkipEmpty: 'true' }, base)
    expect(result.isSkipEmpty).toBe(true)
  })

  it('does not mutate input params', () => {
    const original = { ...base }
    parseStatDateQueryParams({ rangeBy: 'year' }, base)
    expect(base).toEqual(original)
  })

  it('ignores non-integer duration strings', () => {
    const result = parseStatDateQueryParams({ rangeDuration: '3.5' }, base)
    expect(result).toEqual(base)
  })

  it('applies zero values for numeric fields', () => {
    const result = parseStatDateQueryParams({ rangeDuration: '0' }, base)
    expect(result.rangeDuration).toBe(0)
  })
})

describe('normalizeStoredStatDateParams', () => {
  it('restores missing date fields from defaults', () => {
    const result = normalizeStoredStatDateParams({ rangeBy: undefined, rangeDuration: 30 }, defaultStatDateParams)

    expect(result.rangeDuration).toBe(30)
    expect(result.rangeBy).toBe(defaultStatDateParams.rangeBy)
    expect(result.granularityBy).toBe(defaultStatDateParams.granularityBy)
  })

  it('rejects malformed persisted values', () => {
    const result = normalizeStoredStatDateParams({ rangeBy: 'invalid' }, defaultStatDateParams)

    expect(result).toEqual(defaultStatDateParams)
  })
})

describe('computeDateRange', () => {
  const now = new Date('2024-06-15T12:00:00').getTime()
  const maxRange: Range = {
    end: new Date('2024-06-15').getTime(),
    start: new Date('2024-01-01').getTime(),
  }

  it('returns customDate when set', () => {
    const customDate: Range = {
      end: new Date('2024-03-31').getTime(),
      start: new Date('2024-03-01').getTime(),
    }
    const params: StatDateParams = {
      ...defaultStatDateParams,
      customDate,
    }

    const result = computeDateRange(params, maxRange, now)
    expect(result).toEqual(customDate)
  })

  it('returns maxRange when isShowMaxRange + isSkipEmpty', () => {
    const params: StatDateParams = {
      ...defaultStatDateParams,
      isShowMaxRange: true,
      isSkipEmpty: true,
    }

    const result = computeDateRange(params, maxRange, now)
    expect(result.start).toBe(maxRange.start)
    expect(result.end).toBe(maxRange.end)
  })

  it('returns maxRange.start to end-of-period when isShowMaxRange only', () => {
    const params: StatDateParams = {
      ...defaultStatDateParams,
      isShowMaxRange: true,
      isSkipEmpty: false,
      rangeBy: 'month',
    }

    const result = computeDateRange(params, maxRange, now)
    expect(result.start).toBe(maxRange.start)
    expect(result.end).toBeGreaterThanOrEqual(now)
  })

  it('calculates range from offset when no custom/max flags', () => {
    const params: StatDateParams = {
      ...defaultStatDateParams,
      customDate: false,
      isShowMaxRange: false,
      rangeBy: 'day',
      rangeDuration: 7,
      rangeOffset: 0,
    }

    const result = computeDateRange(params, maxRange, now)
    expect(result.start).toBeDefined()
    expect(result.end).toBeDefined()
    expect(result.end).toBeGreaterThanOrEqual(result.start)
  })

  it('applies rangeOffset for navigation', () => {
    const params0: StatDateParams = {
      ...defaultStatDateParams,
      rangeBy: 'month',
      rangeDuration: 1,
      rangeOffset: 0,
    }
    const params1: StatDateParams = {
      ...params0,
      rangeOffset: 1,
    }

    const range0 = computeDateRange(params0, maxRange, now)
    const range1 = computeDateRange(params1, maxRange, now)

    expect(range1.start).toBeLessThan(range0.start)
    expect(range1.end).toBeLessThan(range0.end)
  })

  it('slides a current year by one month while preserving 12 month intervals', () => {
    const params: StatDateParams = {
      ...defaultStatDateParams,
      granularityBy: 'month',
      granularityDuration: 1,
      rangeBy: 'year',
      rangeDuration: 1,
      rangePanOffset: 1,
    }

    const range = computeDateRange(params, maxRange, now)
    const intervals = getIntervalsInRange({
      granularityBy: params.granularityBy,
      granularityDuration: params.granularityDuration,
      range,
    })

    expect(new Date(range.start).toISOString()).toContain('2023-12-01')
    expect(new Date(range.end).toISOString()).toContain('2024-11-30')
    expect(intervals).toHaveLength(12)
  })

  it('priority: customDate overrides isShowMaxRange', () => {
    const customDate: Range = {
      end: new Date('2024-02-28').getTime(),
      start: new Date('2024-02-01').getTime(),
    }
    const params: StatDateParams = {
      ...defaultStatDateParams,
      customDate,
      isShowMaxRange: true,
      isSkipEmpty: true,
    }

    const result = computeDateRange(params, maxRange, now)
    expect(result).toEqual(customDate)
  })
})

describe('defaultStatDateParams', () => {
  it('has expected defaults', () => {
    expect(defaultStatDateParams.customDate).toBe(false)
    expect(defaultStatDateParams.rangeBy).toBe('day')
    expect(defaultStatDateParams.rangeDuration).toBe(14)
    expect(defaultStatDateParams.intervalSelected).toBe(-1)
    expect(defaultStatDateParams.rangeOffset).toBe(0)
    expect(defaultStatDateParams.rangePanOffset).toBe(0)
  })
})

describe('calculateBestGranularityBy', () => {
  it('returns year for range > 400 days', () => {
    const range = {
      end: new Date(2025, 5, 1).getTime(),
      start: new Date(2024, 0, 1).getTime(),
    }
    expect(calculateBestGranularityBy(range)).toBe('year')
  })

  it('returns month at exactly 401 days', () => {
    const start = new Date(2024, 0, 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 401)
    expect(
      calculateBestGranularityBy({
        end: end.getTime(),
        start: start.getTime(),
      }),
    ).toBe('year')
  })

  it('returns month for range 81–400 days', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(2025, 6, 1) // ~181 days
    expect(
      calculateBestGranularityBy({
        end: end.getTime(),
        start: start.getTime(),
      }),
    ).toBe('month')
  })

  it('returns day for range <= 80 days', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(2025, 1, 15) // ~45 days
    expect(
      calculateBestGranularityBy({
        end: end.getTime(),
        start: start.getTime(),
      }),
    ).toBe('day')
  })

  it('returns month at boundary 400 days', () => {
    const start = new Date(2024, 0, 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 400)
    expect(
      calculateBestGranularityBy({
        end: end.getTime(),
        start: start.getTime(),
      }),
    ).toBe('month')
  })

  it('returns day at boundary 80 days', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(start)
    end.setDate(end.getDate() + 80)
    expect(
      calculateBestGranularityBy({
        end: end.getTime(),
        start: start.getTime(),
      }),
    ).toBe('day')
  })
})
