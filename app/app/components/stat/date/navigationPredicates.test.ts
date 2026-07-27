import type { Range } from '~~/utils/date/types'

import { describe, expect, it } from 'vitest'
import { getEndOf, getStartOf } from '~~/utils/date/period'

import type { StatDateParams } from '~/components/stat/date/types'

import { defaultStatDateParams } from '~/components/stat/date/params'

import { isEnd, isShowNav, isShowNavHome, isStart } from './navigationPredicates'

const now = new Date('2024-06-15T12:00:00Z')
const base: StatDateParams = { ...defaultStatDateParams, rangeBy: 'month', rangeDuration: 1 }

describe('isShowNav', () => {
  it('is false when isShowMaxRange', () => {
    const params: StatDateParams = { ...base, isShowMaxRange: true }
    const range: Range = { end: now.getTime(), start: now.getTime() - 1 }
    expect(isShowNav(params, range, range, now)).toBe(false)
  })

  it('is true when range.start is in the past', () => {
    const range: Range = { end: now.getTime(), start: now.getTime() - 1000 }
    const maxRange = range
    expect(isShowNav(base, range, maxRange, now)).toBe(true)
  })

  it('is false when range equals maxRange and start is not in the past', () => {
    const range: Range = { end: now.getTime() + 1000, start: now.getTime() + 500 }
    expect(isShowNav(base, range, range, now)).toBe(false)
  })

  it('is true when start is not in the past but range differs from maxRange on both ends', () => {
    const range: Range = { end: now.getTime() + 1000, start: now.getTime() + 500 }
    const maxRange: Range = { end: now.getTime() + 2000, start: now.getTime() + 1500 }
    expect(isShowNav(base, range, maxRange, now)).toBe(true)
  })

  it('is false when only one of start/end differs from maxRange', () => {
    const range: Range = { end: now.getTime() + 1000, start: now.getTime() + 500 }
    const maxRange: Range = { end: now.getTime() + 2000, start: range.start }
    expect(isShowNav(base, range, maxRange, now)).toBe(false)
  })
})

describe('isEnd', () => {
  it('is true when range.end equals the end of the current period (boundary)', () => {
    const params: StatDateParams = { ...base, rangeBy: 'month' }
    const range: Range = { end: getEndOf(now, 'month').getTime(), start: 0 }
    expect(isEnd(params, range, now)).toBe(true)
  })

  it('is false when range.end is one ms before the end of the current period', () => {
    const params: StatDateParams = { ...base, rangeBy: 'month' }
    const range: Range = { end: getEndOf(now, 'month').getTime() - 1, start: 0 }
    expect(isEnd(params, range, now)).toBe(false)
  })

  it('is true when range.end is past the end of the current period', () => {
    const params: StatDateParams = { ...base, rangeBy: 'year' }
    const range: Range = { end: getEndOf(now, 'year').getTime() + 1, start: 0 }
    expect(isEnd(params, range, now)).toBe(true)
  })
})

describe('isStart', () => {
  it('is true when range.start equals maxRange.start (boundary)', () => {
    const maxRange: Range = { end: now.getTime(), start: now.getTime() - 1000 }
    const range: Range = { end: now.getTime(), start: maxRange.start }
    expect(isStart(range, maxRange)).toBe(true)
  })

  it('is true when range.start is before maxRange.start', () => {
    const maxRange: Range = { end: now.getTime(), start: now.getTime() - 1000 }
    const range: Range = { end: now.getTime(), start: maxRange.start - 1 }
    expect(isStart(range, maxRange)).toBe(true)
  })

  it('is false when range.start is after maxRange.start', () => {
    const maxRange: Range = { end: now.getTime(), start: now.getTime() - 1000 }
    const range: Range = { end: now.getTime(), start: maxRange.start + 1 }
    expect(isStart(range, maxRange)).toBe(false)
  })
})

describe('isShowNavHome', () => {
  const params: StatDateParams = { ...base, intervalSelected: -1, isShowMaxRange: false, rangeBy: 'month', rangeDuration: 1 }
  const currentPeriod: Range = {
    end: getEndOf(now, 'month').getTime(),
    start: getStartOf(now, 'month').getTime(),
  }
  const previousMonth: Range = {
    end: getEndOf(new Date('2024-05-15T12:00:00Z'), 'month').getTime(),
    start: getStartOf(new Date('2024-05-15T12:00:00Z'), 'month').getTime(),
  }

  it('is false when isShowMaxRange', () => {
    expect(isShowNavHome({ ...params, isShowMaxRange: true }, currentPeriod, now)).toBe(false)
  })

  it('is true when an interval is selected, even on the current period', () => {
    expect(isShowNavHome({ ...params, intervalSelected: 2 }, currentPeriod, now)).toBe(true)
  })

  it('is false when already on the current period and no interval is selected', () => {
    expect(isShowNavHome(params, currentPeriod, now)).toBe(false)
  })

  it('is true when range differs from the current period on both start and end', () => {
    expect(isShowNavHome(params, previousMonth, now)).toBe(true)
  })

  it('is false when only the start differs from the current period', () => {
    const range: Range = { end: currentPeriod.end, start: previousMonth.start }
    expect(isShowNavHome(params, range, now)).toBe(false)
  })
})
