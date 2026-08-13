import type { ComputedRef } from 'vue'
import type { Range } from '~~/utils/date/types'

import type { StatReportContext } from '~/components/stat/useStatReportContext'
import type { TrnId } from '~/components/trns/types'

import { computeDateRange } from '~/components/stat/date/params'
import { buildStatVirtualRows, canApplyStatLoadResult, collectMaterializedStatOffsets, filterAvailableTrnIds, findStatPeriodOffsetForDate, uniqueSortedOffsets } from '~/components/stat/infinitePeriods'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export type StatFeedLoadReason = 'forward-scroll' | 'initial-fill' | 'manual'

export type StatFeedLoadResult
  = | { offset: number, status: 'appended' }
    | { status: 'exhausted' }
    | { status: 'ignored' }

export function useStatInfinitePeriods(ctx: StatReportContext, options: {
  filterByTypeIds: ComputedRef<TrnId[]>
  isEnabled: ComputedRef<boolean>
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

  function idsForRange(range: Range): TrnId[] {
    return trnsStore.getStoreTrnsIds({
      categoriesIds: ctx.effectiveFilteredCategoriesIds.value,
      dates: range,
      sort: true,
      trnsIds: ctx.params.trnsIds.value,
      trnsTypes: ctx.selectedTypesMapping.value,
    })
  }

  function filteredIdsForRange(range: Range): TrnId[] {
    return filterAvailableTrnIds(idsForRange(range), options.filterByTypeIds.value)
  }

  function appendOffsets(offsets: readonly number[]) {
    loadedOffsets.value = uniqueSortedOffsets([...loadedOffsets.value, ...offsets])
  }

  function findNextHistoricalTransaction() {
    const frontierStart = rangeForOffset(searchedThroughOffset.value).start
    const minimumDate = ctx.params.statDate.maxRange.value.start
    for (const id of options.filterByTypeIds.value) {
      const transaction = trnsStore.items?.[id]
      if (transaction && transaction.date < frontierStart && transaction.date >= minimumDate)
        return transaction
    }
    return undefined
  }

  function materializeSearchedOffsets() {
    const dates = options.filterByTypeIds.value.flatMap((id) => {
      const date = trnsStore.items?.[id]?.date
      return date === undefined ? [] : [date]
    })
    appendOffsets(collectMaterializedStatOffsets(
      dates,
      baseOffset.value,
      searchedThroughOffset.value,
      rangeForOffset,
    ))
  }

  const periods = computed(() => loadedOffsets.value.map(offset => ({
    ids: filteredIdsForRange(rangeForOffset(offset)),
    offset,
    range: rangeForOffset(offset),
  })))
  const basePeriod = computed(() => periods.value.find(period => period.offset === baseOffset.value))
  const isBasePeriodEmpty = computed(() => (basePeriod.value?.ids.length ?? 0) === 0)
  const isExhausted = computed(() => exhaustedFilterGeneration.value === localFilterGeneration.value
    || !findNextHistoricalTransaction())
  const canLoadMore = computed(() => canScanPeriods.value && !isExhausted.value)

  const rows = computed(() => buildStatVirtualRows(periods.value, trnsStore.items, canLoadMore.value))

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
      const target = findNextHistoricalTransaction()
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

  watch(options.filterByTypeIds, () => {
    localFilterGeneration.value++
    exhaustedFilterGeneration.value = null
    materializeSearchedOffsets()
  }, { flush: 'sync' })

  function setActiveOffset(offset: number) {
    if (offset === baseOffset.value)
      ctx.params.statDate.clearScrollRangeOffset()
    else
      ctx.params.statDate.setScrollRangeOffset(offset)
  }

  return {
    canLoadMore,
    generation: readonly(generation),
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
    rows,
    searchedThroughOffset: readonly(searchedThroughOffset),
    setActiveOffset,
  }
}
