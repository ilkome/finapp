import type { Range } from '~~/utils/date/types'

import { describe, expect, it } from 'vitest'
import { getEndOf, getStartOf } from '~~/utils/date/period'

import {
  buildChartWindowIntervals,
  compactChartBuffer,
  mergeChartWindowIntervals,
  resolveCommittedPanOffset,
  resolveVisibleWindow,
  shouldExtendChartBuffer,
} from './chartWindow'

function monthRange(year: number, month: number): Range {
  const date = new Date(year, month, 1)
  return { end: getEndOf(date, 'month').getTime(), start: getStartOf(date, 'month').getTime() }
}

function months(startYear: number, startMonth: number, count: number) {
  return Array.from({ length: count }, (_, index) => monthRange(startYear, startMonth + index))
}

describe('chartWindow', () => {
  it('builds one bounded window on either side of twelve visible months', () => {
    const visible = months(2025, 0, 12)
    const result = buildChartWindowIntervals({
      earliestStart: monthRange(2020, 0).start,
      granularityBy: 'month',
      granularityDuration: 1,
      latestEnd: monthRange(2027, 11).end,
      visibleIntervals: visible,
    })

    expect(result).toHaveLength(36)
    expect(resolveVisibleWindow(result, visible[0]!.start, visible.at(-1)!.start)).toEqual(visible)
  })

  it('keeps fourteen daily buckets visible inside a forty-two bucket buffer', () => {
    const visible = Array.from({ length: 14 }, (_, index) => ({
      end: getEndOf(new Date(2025, 5, 1 + index), 'day').getTime(),
      start: getStartOf(new Date(2025, 5, 1 + index), 'day').getTime(),
    }))
    const result = buildChartWindowIntervals({
      earliestStart: getStartOf(new Date(2025, 0, 1), 'day').getTime(),
      granularityBy: 'day',
      granularityDuration: 1,
      latestEnd: getEndOf(new Date(2025, 11, 31), 'day').getTime(),
      visibleIntervals: visible,
    })

    expect(result).toHaveLength(42)
  })

  it('shortens unavailable boundary sides without dropping visible intervals', () => {
    const visible = months(2025, 0, 6)
    const result = buildChartWindowIntervals({
      earliestStart: visible[0]!.start,
      granularityBy: 'month',
      granularityDuration: 1,
      latestEnd: monthRange(2025, 8).end,
      visibleIntervals: visible,
    })

    expect(result).toHaveLength(9)
    expect(result.slice(0, 6)).toEqual(visible)
  })

  it('merges extensions by stable key and compacts around the viewport', () => {
    const all = months(2023, 0, 48)
    const merged = mergeChartWindowIntervals(all.slice(0, 24), all.slice(12, 36), all.slice(24))
    const compacted = compactChartBuffer(merged, all[18]!.start, all[29]!.start, 12)

    expect(merged).toHaveLength(48)
    expect(compacted).toHaveLength(36)
    expect(compacted[12]).toEqual(all[18])
  })

  it('allows one transient edge block before returning to three windows', () => {
    const visible = months(2025, 0, 12)
    const extended = buildChartWindowIntervals({
      earliestStart: monthRange(2020, 0).start,
      extensionDirection: 'past',
      granularityBy: 'month',
      granularityDuration: 1,
      latestEnd: monthRange(2028, 11).end,
      visibleIntervals: visible,
    })
    const compacted = compactChartBuffer(extended, visible[0]!.start, visible.at(-1)!.start, visible.length)

    expect(extended).toHaveLength(48)
    expect(new Set(extended.map(interval => interval.start)).size).toBe(48)
    expect(compacted).toHaveLength(36)
  })

  it('maps a multi-bucket preview to one committed pan offset', () => {
    const intervals = months(2024, 0, 36)
    expect(resolveCommittedPanOffset({
      committedStartValue: intervals[12]!.start,
      currentPanOffset: 4,
      intervals,
      previewStartValue: intervals[7]!.start,
    })).toBe(9)
  })

  it('requests extension only in the outer quarter', () => {
    const intervals = months(2024, 0, 36)
    expect(shouldExtendChartBuffer({ direction: 'past', endValue: intervals[13]!.start, intervals, startValue: intervals[2]!.start })).toBe(true)
    expect(shouldExtendChartBuffer({ direction: 'future', endValue: intervals[33]!.start, intervals, startValue: intervals[22]!.start })).toBe(true)
    expect(shouldExtendChartBuffer({ direction: 'past', endValue: intervals[23]!.start, intervals, startValue: intervals[12]!.start })).toBe(false)
  })
})
