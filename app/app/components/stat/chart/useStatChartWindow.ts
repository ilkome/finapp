import { computed, getCurrentScope, nextTick, onScopeDispose, shallowRef, watch } from 'vue'

import type { StatDateProvider } from '~/components/stat/date/types'

import { computeDateRange } from '~/components/stat/date/params'

import { buildChartWindowIntervals, resolveCommittedPanOffset, shouldExtendChartBuffer } from './chartWindow'

export const statChartCommitDelay = 150

export function useStatChartWindow(params: { statDate: StatDateProvider }) {
  const previewStartValue = shallowRef<number>()
  const previewEndValue = shallowRef<number>()
  const commitCount = shallowRef(0)
  const generation = shallowRef(0)
  const requestedDirection = shallowRef<'future' | 'past'>()
  let commitTimer: ReturnType<typeof setTimeout> | undefined

  const isEnabled = computed(() => !params.statDate.params.value.isShowMaxRange && params.statDate.intervalsInRange.value.length > 1)
  const latestEnd = computed(() => computeDateRange({
    ...params.statDate.params.value,
    intervalSelected: -1,
    rangeOffset: 0,
    rangePanOffset: 0,
  }, params.statDate.maxRange?.value ?? params.statDate.range.value, Date.now()).end)
  const bufferIntervals = computed(() => {
    const visible = params.statDate.intervalsInRange.value
    if (!isEnabled.value)
      return visible
    return buildChartWindowIntervals({
      earliestStart: params.statDate.maxRange?.value.start ?? visible[0]!.start,
      extensionDirection: requestedDirection.value,
      granularityBy: params.statDate.params.value.granularityBy,
      granularityDuration: params.statDate.params.value.granularityDuration,
      latestEnd: latestEnd.value,
      visibleIntervals: visible,
    })
  })
  const committedStartValue = computed(() => params.statDate.intervalsInRange.value[0]?.start)
  const committedEndValue = computed(() => params.statDate.intervalsInRange.value.at(-1)?.start)
  const startValue = computed(() => previewStartValue.value ?? committedStartValue.value)
  const endValue = computed(() => previewEndValue.value ?? committedEndValue.value)

  function clearTimer() {
    if (commitTimer)
      clearTimeout(commitTimer)
    commitTimer = undefined
  }

  function restoreCommittedViewport() {
    clearTimer()
    previewStartValue.value = undefined
    previewEndValue.value = undefined
    requestedDirection.value = undefined
  }

  function commitPreview(expectedGeneration = generation.value) {
    clearTimer()
    if (expectedGeneration !== generation.value || previewStartValue.value === undefined || committedStartValue.value === undefined)
      return false
    const nextOffset = resolveCommittedPanOffset({
      committedStartValue: committedStartValue.value,
      currentPanOffset: params.statDate.params.value.rangePanOffset,
      intervals: bufferIntervals.value,
      previewStartValue: previewStartValue.value,
    })
    const committed = params.statDate.setRangePanOffset(nextOffset)
    if (committed)
      commitCount.value++
    restoreCommittedViewport()
    return committed
  }

  function onPreview(nextStartValue: number, nextEndValue: number) {
    if (!isEnabled.value)
      return
    const intervals = bufferIntervals.value
    const visibleWidth = params.statDate.intervalsInRange.value.length
    let startIndex = intervals.findIndex(interval => interval.start === nextStartValue)
    if (startIndex < 0)
      return
    startIndex = Math.min(startIndex, Math.max(0, intervals.length - visibleWidth))
    const endIndex = startIndex + visibleWidth - 1
    previewStartValue.value = intervals[startIndex]?.start
    previewEndValue.value = intervals[endIndex]?.start ?? nextEndValue
    if (!requestedDirection.value) {
      requestedDirection.value = shouldExtendChartBuffer({
        direction: 'past',
        endValue: previewEndValue.value!,
        intervals,
        startValue: previewStartValue.value!,
      })
        ? 'past'
        : shouldExtendChartBuffer({
          direction: 'future',
          endValue: previewEndValue.value!,
          intervals,
          startValue: previewStartValue.value!,
        })
          ? 'future'
          : undefined
    }

    clearTimer()
    const expectedGeneration = generation.value
    commitTimer = setTimeout(commitPreview, statChartCommitDelay, expectedGeneration)
  }

  async function selectIntervalByKey(intervalKey: number) {
    if (previewStartValue.value !== undefined) {
      commitPreview()
      await nextTick()
    }
    const index = params.statDate.intervalsInRange.value.findIndex(interval => interval.start === intervalKey)
    return index < 0 ? undefined : params.statDate.selectInterval(index)
  }

  watch(
    () => [
      params.statDate.params.value.customDate,
      params.statDate.params.value.granularityBy,
      params.statDate.params.value.granularityDuration,
      params.statDate.params.value.isShowMaxRange,
      params.statDate.params.value.rangeBy,
      params.statDate.params.value.rangeDuration,
      params.statDate.params.value.rangeOffset,
      params.statDate.params.value.rangePanOffset,
    ],
    () => {
      generation.value++
      restoreCommittedViewport()
    },
  )

  if (getCurrentScope())
    onScopeDispose(clearTimer)

  return {
    bufferIntervals,
    commitCount,
    commitPreview,
    endValue,
    generation,
    isEnabled,
    onPreview,
    requestedDirection,
    selectIntervalByKey,
    startValue,
  }
}
