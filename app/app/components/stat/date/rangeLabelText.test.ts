import { describe, expect, it } from 'vitest'

import type { StatDateParams } from '~/components/stat/date/types'

import { labelRange, statDateRangeLabel } from '~/components/stat/date/rangeLabelText'

const params: StatDateParams = {
  customDate: false,
  granularityBy: 'day',
  granularityDuration: 1,
  intervalSelected: -1,
  isShowMaxRange: false,
  isSkipEmpty: false,
  rangeBy: 'month',
  rangeDuration: 1,
  rangeOffset: 0,
  rangePanOffset: 0,
}

const range = { end: Date.UTC(2024, 4, 31, 23, 59), start: Date.UTC(2024, 4, 1) }
const intervalsInRange = [
  { end: Date.UTC(2024, 4, 1, 23, 59), start: Date.UTC(2024, 4, 1) },
  { end: Date.UTC(2024, 4, 2, 23, 59), start: Date.UTC(2024, 4, 2) },
]

const t = (key: string) => key

describe('statDateRangeLabel', () => {
  it('falls back to the whole range when no interval is selected', () => {
    expect(labelRange({ intervalsInRange, params, range })).toEqual(range)
    expect(labelRange({ intervalsInRange, params: { ...params, intervalSelected: 1 }, range })).toEqual(intervalsInRange[1])
    expect(labelRange({ intervalsInRange, params: { ...params, intervalSelected: 9 }, range })).toEqual(range)
  })

  it('shows the all-time key only for a max range with no interval selected', () => {
    expect(statDateRangeLabel({ intervalsInRange, params: { ...params, isShowMaxRange: true }, range }, t, 'en')).toBe('dates.ranges.allTime')
    expect(statDateRangeLabel({ intervalsInRange, params: { ...params, intervalSelected: 0, isShowMaxRange: true }, range }, t, 'en')).not.toBe('dates.ranges.allTime')
  })

  it('formats a panned range exactly instead of as a period', () => {
    const panned = statDateRangeLabel({ intervalsInRange, params: { ...params, rangePanOffset: 1 }, range }, t, 'en')
    expect(panned).toBe(statDateRangeLabel({ intervalsInRange, params: { ...params, isShowMaxRange: true, rangePanOffset: 1 }, range }, t, 'en'))
    expect(panned).toBeTruthy()
  })
})
