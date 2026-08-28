import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'

import type { StatDateParams } from '~/components/stat/date/types'

import { useStatChartWindow } from './useStatChartWindow'

function createProvider() {
  const intervals = Array.from({ length: 12 }, (_, index) => ({
    end: new Date(2025, index + 1, 0, 23, 59, 59, 999).getTime(),
    start: new Date(2025, index, 1).getTime(),
  }))
  const params = ref({
    customDate: false,
    granularityBy: 'month',
    granularityDuration: 1,
    intervalSelected: -1,
    isShowMaxRange: false,
    isSkipEmpty: false,
    rangeBy: 'year',
    rangeDuration: 1,
    rangeOffset: 0,
    rangePanOffset: 0,
  } satisfies StatDateParams)
  const setRangePanOffset = vi.fn((next: number) => {
    if (next < 0)
      return false
    params.value.rangePanOffset = next
    return true
  })
  return {
    intervals,
    provider: {
      intervalsInRange: ref(intervals),
      maxRange: ref({ end: intervals.at(-1)!.end, start: new Date(2020, 0, 1).getTime() }),
      params,
      range: ref({ end: intervals.at(-1)!.end, start: intervals[0]!.start }),
      selectInterval: vi.fn((index: number) => intervals[index]?.start),
      setRangePanOffset,
    } as any,
    setRangePanOffset,
  }
}

afterEach(() => vi.useRealTimers())

describe('useStatChartWindow', () => {
  it('keeps preview local and commits once after the idle delay', async () => {
    vi.useFakeTimers()
    const { provider, setRangePanOffset } = createProvider()
    const scope = effectScope()
    const chartWindow = scope.run(() => useStatChartWindow({ statDate: provider }))!
    const start = chartWindow.bufferIntervals.value.findIndex(item => item.start === provider.intervalsInRange.value[0]!.start)

    chartWindow.onPreview(chartWindow.bufferIntervals.value[start - 2]!.start, chartWindow.bufferIntervals.value[start + 9]!.start)
    chartWindow.onPreview(chartWindow.bufferIntervals.value[start - 3]!.start, chartWindow.bufferIntervals.value[start + 8]!.start)
    expect(setRangePanOffset).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(150)
    expect(setRangePanOffset).toHaveBeenCalledTimes(1)
    expect(setRangePanOffset).toHaveBeenCalledWith(3)
    expect(chartWindow.commitCount.value).toBe(1)
    scope.stop()
  })

  it('cancels a pending commit when its generation changes', async () => {
    vi.useFakeTimers()
    const { provider, setRangePanOffset } = createProvider()
    const scope = effectScope()
    const chartWindow = scope.run(() => useStatChartWindow({ statDate: provider }))!
    const start = chartWindow.bufferIntervals.value.findIndex(item => item.start === provider.intervalsInRange.value[0]!.start)
    chartWindow.onPreview(chartWindow.bufferIntervals.value[start - 1]!.start, chartWindow.bufferIntervals.value[start + 10]!.start)
    provider.params.value.granularityDuration = 2
    await nextTick()
    await vi.advanceTimersByTimeAsync(150)

    expect(setRangePanOffset).not.toHaveBeenCalled()
    scope.stop()
  })

  it('latches one adjacent block when preview reaches a buffer edge', () => {
    vi.useFakeTimers()
    const { provider } = createProvider()
    const scope = effectScope()
    const chartWindow = scope.run(() => useStatChartWindow({ statDate: provider }))!
    const initialSize = chartWindow.bufferIntervals.value.length
    chartWindow.onPreview(chartWindow.bufferIntervals.value[1]!.start, chartWindow.bufferIntervals.value[12]!.start)

    expect(chartWindow.requestedDirection.value).toBe('past')
    expect(chartWindow.bufferIntervals.value.length).toBeGreaterThan(initialSize)
    expect(chartWindow.bufferIntervals.value.length).toBeLessThanOrEqual(provider.intervalsInRange.value.length * 4)
    scope.stop()
  })

  it('cancels pending work when its scope is disposed', async () => {
    vi.useFakeTimers()
    const { provider, setRangePanOffset } = createProvider()
    const scope = effectScope()
    const chartWindow = scope.run(() => useStatChartWindow({ statDate: provider }))!
    const start = chartWindow.bufferIntervals.value.findIndex(item => item.start === provider.intervalsInRange.value[0]!.start)
    chartWindow.onPreview(chartWindow.bufferIntervals.value[start - 1]!.start, chartWindow.bufferIntervals.value[start + 10]!.start)
    scope.stop()
    await vi.advanceTimersByTimeAsync(150)

    expect(setRangePanOffset).not.toHaveBeenCalled()
  })
})
