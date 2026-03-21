import { describe, expect, it } from 'vitest'

import type { Range, StatDateParams } from '~/components/date/types'

import { computeDateRange, defaultStatDateParams, parseStatDateQueryParams } from './statDateParams'

// --- parseStatDateQueryParams ---

describe('parseStatDateQueryParams', () => {
  const base: StatDateParams = { ...defaultStatDateParams }

  it('returns current params on invalid query', () => {
    const result = parseStatDateQueryParams({ rangeBy: 'invalid' as any }, base)
    expect(result).toEqual(base)
  })

  it('merges valid rangeBy and rangeDuration', () => {
    const result = parseStatDateQueryParams(
      { rangeBy: 'month', rangeDuration: '3' },
      base,
    )
    expect(result.rangeBy).toBe('month')
    expect(result.rangeDuration).toBe(3)
    expect(result.intervalsBy).toBe(base.intervalsBy)
  })

  it('merges intervalsBy and intervalsDuration', () => {
    const result = parseStatDateQueryParams(
      { intervalsBy: 'week', intervalsDuration: '2' },
      base,
    )
    expect(result.intervalsBy).toBe('week')
    expect(result.intervalsDuration).toBe(2)
  })

  it('merges intervalSelected', () => {
    const result = parseStatDateQueryParams(
      { intervalSelected: '5' },
      base,
    )
    expect(result.intervalSelected).toBe(5)
  })

  it('merges rangeOffset', () => {
    const result = parseStatDateQueryParams(
      { rangeOffset: '-2' },
      base,
    )
    expect(result.rangeOffset).toBe(-2)
  })

  it('merges boolean isShowMaxRange', () => {
    const result = parseStatDateQueryParams(
      { isShowMaxRange: 'true' },
      base,
    )
    expect(result.isShowMaxRange).toBe(true)
  })

  it('merges boolean isSkipEmpty', () => {
    const result = parseStatDateQueryParams(
      { isSkipEmpty: 'true' },
      base,
    )
    expect(result.isSkipEmpty).toBe(true)
  })

  it('does not mutate input params', () => {
    const original = { ...base }
    parseStatDateQueryParams({ rangeBy: 'year' }, base)
    expect(base).toEqual(original)
  })

  it('ignores non-integer duration strings', () => {
    const result = parseStatDateQueryParams(
      { rangeDuration: '3.5' },
      base,
    )
    expect(result).toEqual(base)
  })

  it('applies zero values for numeric fields', () => {
    const result = parseStatDateQueryParams(
      { rangeDuration: '0' },
      base,
    )
    expect(result.rangeDuration).toBe(0)
  })
})

// --- computeDateRange ---

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
    // end should be end of current month, not maxRange.end
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

    // positive offset subtracts time (goes back)
    expect(range1.start).toBeLessThan(range0.start)
    expect(range1.end).toBeLessThan(range0.end)
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

// --- defaultStatDateParams ---

describe('defaultStatDateParams', () => {
  it('has expected defaults', () => {
    expect(defaultStatDateParams.customDate).toBe(false)
    expect(defaultStatDateParams.rangeBy).toBe('day')
    expect(defaultStatDateParams.rangeDuration).toBe(14)
    expect(defaultStatDateParams.intervalSelected).toBe(-1)
    expect(defaultStatDateParams.rangeOffset).toBe(0)
  })
})
