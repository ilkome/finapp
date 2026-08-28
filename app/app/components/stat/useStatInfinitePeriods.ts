import type { ComputedRef } from 'vue'
import type { Range } from '~~/utils/date/types'

import type { StatReportContext } from '~/components/stat/report/types'
import type { StatFeedLocalFilter } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { computeDateRange } from '~/components/stat/date/params'
import { deferStatDevMetricsUpdate } from '~/components/stat/statDevMetrics'
import { buildStatFeedIndex, buildStatVirtualRows, canApplyStatLoadResult, findStatPeriodOffsetForDate, mergeStatOffsets, resolveStatScrollRangeOffset } from '~/components/stat/statFeed'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export type StatFeedLoadReason = 'forward-scroll' | 'initial-fill' | 'manual'

export type StatFeedLoadResult
  = | { offset: number, status: 'appended' }
    | { status: 'exhausted' }
    | { status: 'ignored' }

export function useStatInfinitePeriods(ctx: StatReportContext, options: {
  candidateIds: ComputedRef<TrnId[]>
  isEnabled: ComputedRef<boolean>
  localFilter: ComputedRef<StatFeedLocalFilter>
}) {
  const trnsStore = useTrnsStore()
  const baseOffset = computed(() => ctx.params.statDate.params.value.rangeOffset)
  const loadedOffsets = ref<number[]>([baseOffset.value])
  const searchedThroughOffset = ref(baseOffset.value)
  const referenceNow = ref(Date.now())
  const generation = ref(0)
  const localFilterGeneration = ref(0)
  const exhaustedFilterGeneration = ref<number | null>(null)
  const isLoading = ref(false)
  const loadRequestCount = ref(0)
  const lastLoadReason = ref<StatFeedLoadReason | null>(null)
  const indexBuildCount = shallowRef(0)
  const indexBuildDuration = shallowRef(0)
  const indexVisitedIds = shallowRef(0)
  const rowBuildCount = shallowRef(0)
  const rowBuildDuration = shallowRef(0)
  let indexBuildSequence = 0
  let rowBuildSequence = 0

  const canScanPeriods = computed(() => {
    const params = ctx.params.statDate.params.value
    return options.isEnabled.value
      && !params.customDate
      && !params.isShowMaxRange
  })

  function rangeForOffset(offset: number): Range {
    return computeDateRange({
      ...ctx.params.statDate.params.value,
      intervalSelected: -1,
      rangeOffset: offset,
    }, ctx.params.statDate.maxRange.value, referenceNow.value)
  }

  function now() {
    return typeof performance === 'undefined' ? Date.now() : performance.now()
  }

  function appendOffsets(offsets: readonly number[]) {
    const merged = mergeStatOffsets(loadedOffsets.value, offsets)
    if (merged.changed)
      loadedOffsets.value = [...merged.offsets]
  }

  const feedIndex = computed(() => {
    const startedAt = now()
    const result = buildStatFeedIndex({
      baseOffset: baseOffset.value,
      candidateIds: options.candidateIds.value,
      filter: options.localFilter.value,
      items: trnsStore.items,
      minimumDate: ctx.params.statDate.maxRange.value.start,
      rangeForOffset,
      searchedThroughOffset: searchedThroughOffset.value,
    })
    if (import.meta.dev) {
      const buildCount = ++indexBuildSequence
      const duration = now() - startedAt
      const visitedIds = result.metrics.visitedIds
      deferStatDevMetricsUpdate(() => {
        indexBuildCount.value = buildCount
        indexBuildDuration.value = duration
        indexVisitedIds.value = visitedIds
      })
    }
    return result
  })

  const displayOffsets = computed(() => mergeStatOffsets(
    options.isEnabled.value ? loadedOffsets.value : [baseOffset.value],
    options.isEnabled.value ? feedIndex.value.materializedOffsets : [],
  ).offsets)

  const periods = computed(() => displayOffsets.value.map(offset => ({
    ids: feedIndex.value.idsByOffset.get(offset) ?? [],
    offset,
    range: rangeForOffset(offset),
  })))
  const basePeriod = computed(() => periods.value.find(period => period.offset === baseOffset.value))
  const isBasePeriodEmpty = computed(() => (basePeriod.value?.ids.length ?? 0) === 0)
  const isExhausted = computed(() => exhaustedFilterGeneration.value === localFilterGeneration.value
    || !feedIndex.value.nextHistoricalId)
  const canLoadMore = computed(() => canScanPeriods.value && !isExhausted.value)

  const rows = computed(() => {
    const startedAt = now()
    const result = buildStatVirtualRows({
      baseOffset: baseOffset.value,
      canLoadMore: canLoadMore.value,
      items: trnsStore.items,
      periods: periods.value,
    })
    if (import.meta.dev) {
      const buildCount = ++rowBuildSequence
      const duration = now() - startedAt
      deferStatDevMetricsUpdate(() => {
        rowBuildCount.value = buildCount
        rowBuildDuration.value = duration
      })
    }
    return result
  })

  function reset() {
    generation.value++
    localFilterGeneration.value = 0
    exhaustedFilterGeneration.value = null
    loadedOffsets.value = [baseOffset.value]
    searchedThroughOffset.value = baseOffset.value
    referenceNow.value = Date.now()
    lastLoadReason.value = null
    ctx.params.statDate.clearScrollRangeOffset()
  }

  function loadMore(reason: StatFeedLoadReason = 'manual'): StatFeedLoadResult {
    if (!canScanPeriods.value || isLoading.value || exhaustedFilterGeneration.value === localFilterGeneration.value)
      return { status: 'ignored' }

    const requestGeneration = generation.value
    const requestLocalFilterGeneration = localFilterGeneration.value
    isLoading.value = true
    loadRequestCount.value++
    lastLoadReason.value = reason
    try {
      const targetId = feedIndex.value.nextHistoricalId
      const target = targetId ? trnsStore.items?.[targetId] : undefined
      if (!target) {
        exhaustedFilterGeneration.value = requestLocalFilterGeneration
        return { status: 'exhausted' }
      }

      const offset = findStatPeriodOffsetForDate(target.date, baseOffset.value, rangeForOffset)
      if (offset === null) {
        exhaustedFilterGeneration.value = requestLocalFilterGeneration
        return { status: 'exhausted' }
      }

      if (!canApplyStatLoadResult(
        generation.value,
        localFilterGeneration.value,
        requestGeneration,
        requestLocalFilterGeneration,
      )) {
        return { status: 'ignored' }
      }

      searchedThroughOffset.value = Math.max(searchedThroughOffset.value, offset)
      appendOffsets([offset])
      return { offset, status: 'appended' }
    }
    finally {
      isLoading.value = false
    }
  }

  watch([
    () => options.localFilter.value.filterBy,
    () => options.localFilter.value.showHistoryWithDesc,
    () => options.localFilter.value.showWithDesc,
  ], () => {
    localFilterGeneration.value++
    exhaustedFilterGeneration.value = null
  })

  watch(() => feedIndex.value.materializedOffsets, appendOffsets)

  function setActiveOffset(offset: number) {
    const scrollRangeOffset = resolveStatScrollRangeOffset(offset, baseOffset.value)
    if (scrollRangeOffset === null)
      ctx.params.statDate.clearScrollRangeOffset()
    else
      ctx.params.statDate.setScrollRangeOffset(scrollRangeOffset)
  }

  return {
    canLoadMore,
    generation: readonly(generation),
    indexBuildCount: readonly(indexBuildCount),
    indexBuildDuration: readonly(indexBuildDuration),
    indexVisitedIds: readonly(indexVisitedIds),
    isBasePeriodEmpty,
    isExhausted,
    isLoading,
    lastLoadReason: readonly(lastLoadReason),
    loadedOffsets: readonly(loadedOffsets),
    loadMore,
    loadRequestCount: readonly(loadRequestCount),
    localFilterGeneration: readonly(localFilterGeneration),
    referenceNow: readonly(referenceNow),
    reset,
    rowBuildCount: readonly(rowBuildCount),
    rowBuildDuration: readonly(rowBuildDuration),
    rows,
    searchedThroughOffset: readonly(searchedThroughOffset),
    setActiveOffset,
  }
}
