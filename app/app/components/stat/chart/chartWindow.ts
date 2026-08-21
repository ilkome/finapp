import type { Period, Range } from '~~/utils/date/types'

import { getIntervalsInRange, shiftRangeByGranularity } from '~/components/stat/date/params'

export type ChartBufferDirection = 'future' | 'past'

function intervalKey(interval: Range) {
  return interval.start
}

export function mergeChartWindowIntervals(...groups: readonly Range[][]): Range[] {
  const intervals = new Map<number, Range>()
  for (const group of groups) {
    for (const interval of group)
      intervals.set(intervalKey(interval), interval)
  }
  return [...intervals.values()].sort((a, b) => a.start - b.start)
}

function shiftedIntervals(params: {
  granularityBy: Period
  granularityDuration: number
  offset: number
  visibleRange: Range
}) {
  const range = shiftRangeByGranularity(params.visibleRange, {
    granularityBy: params.granularityBy,
    granularityDuration: params.granularityDuration,
    rangePanOffset: params.offset,
  })
  return getIntervalsInRange({
    granularityBy: params.granularityBy,
    granularityDuration: params.granularityDuration,
    range,
  })
}

export function buildChartWindowIntervals(params: {
  earliestStart: number
  extensionDirection?: ChartBufferDirection
  granularityBy: Period
  granularityDuration: number
  latestEnd: number
  visibleIntervals: Range[]
}): Range[] {
  const visible = params.visibleIntervals
  if (!visible.length)
    return []

  const width = visible.length
  const visibleRange = { end: visible.at(-1)!.end, start: visible[0]!.start }
  const past = shiftedIntervals({
    ...params,
    offset: width,
    visibleRange,
  }).filter(interval => interval.end >= params.earliestStart)
  const future = shiftedIntervals({
    ...params,
    offset: -width,
    visibleRange,
  }).filter(interval => interval.start <= params.latestEnd)

  const extension = params.extensionDirection
    ? shiftedIntervals({
        ...params,
        offset: params.extensionDirection === 'past' ? width * 2 : width * -2,
        visibleRange,
      }).filter(interval => interval.end >= params.earliestStart && interval.start <= params.latestEnd)
    : []

  if (extension.length) {
    const merged = mergeChartWindowIntervals(past, visible, future, extension)
    const visibleStartIndex = merged.findIndex(interval => interval.start === visible[0]!.start)
    const visibleEndIndex = merged.findIndex(interval => interval.start === visible.at(-1)!.start)
    const pastWidth = params.extensionDirection === 'past' ? width * 2 : width
    const futureWidth = params.extensionDirection === 'future' ? width * 2 : width
    return merged.slice(
      Math.max(0, visibleStartIndex - pastWidth),
      Math.min(merged.length, visibleEndIndex + futureWidth + 1),
    )
  }

  return compactChartBuffer(
    mergeChartWindowIntervals(past, visible, future),
    visible[0]!.start,
    visible.at(-1)!.start,
    width,
  )
}

export function resolveVisibleWindow(
  intervals: readonly Range[],
  startValue: number,
  endValue: number,
): Range[] {
  const startIndex = intervals.findIndex(interval => interval.start === startValue)
  const endIndex = intervals.findIndex(interval => interval.start === endValue)
  if (startIndex < 0 || endIndex < startIndex)
    return []
  return intervals.slice(startIndex, endIndex + 1)
}

export function resolveCommittedPanOffset(params: {
  committedStartValue: number
  currentPanOffset: number
  intervals: readonly Range[]
  previewStartValue: number
}): number {
  const committedIndex = params.intervals.findIndex(interval => interval.start === params.committedStartValue)
  const previewIndex = params.intervals.findIndex(interval => interval.start === params.previewStartValue)
  if (committedIndex < 0 || previewIndex < 0)
    return params.currentPanOffset
  return params.currentPanOffset + committedIndex - previewIndex
}

export function shouldExtendChartBuffer(params: {
  direction: ChartBufferDirection
  endValue: number
  intervals: readonly Range[]
  startValue: number
}): boolean {
  if (params.intervals.length < 2)
    return false
  const startIndex = params.intervals.findIndex(interval => interval.start === params.startValue)
  const endIndex = params.intervals.findIndex(interval => interval.start === params.endValue)
  if (startIndex < 0 || endIndex < 0)
    return false
  const threshold = Math.max(1, Math.ceil(params.intervals.length * 0.25))
  return params.direction === 'past'
    ? startIndex < threshold
    : params.intervals.length - 1 - endIndex < threshold
}

export function compactChartBuffer(
  intervals: readonly Range[],
  visibleStartValue: number,
  visibleEndValue: number,
  visibleWidth: number,
): Range[] {
  if (!intervals.length || visibleWidth <= 0)
    return []
  const startIndex = intervals.findIndex(interval => interval.start === visibleStartValue)
  const endIndex = intervals.findIndex(interval => interval.start === visibleEndValue)
  if (startIndex < 0 || endIndex < startIndex)
    return intervals.slice(0, visibleWidth * 3)
  return intervals.slice(
    Math.max(0, startIndex - visibleWidth),
    Math.min(intervals.length, endIndex + visibleWidth + 1),
  )
}
