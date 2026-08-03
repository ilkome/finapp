import type { ComputedRef } from 'vue'
import type { Range } from '~~/utils/date/types'

import type { StatReportContext } from '~/components/stat/useStatReportContext'
import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId } from '~/components/trns/types'

import { computeDateRange } from '~/components/stat/date/params'
import { filterAvailableTrnIds, hasUnloadedTrnIds } from '~/components/stat/infinitePeriods'
import { buildTrnsDisplayRows } from '~/components/trns/listRows'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export type StatVirtualRow
  = | { id: string, offset: number, type: 'periodAnchor' }
    | (TrnsDisplayRow & { offset: number })
    | { id: string, type: 'loader' }
    | { id: string, type: 'end' }

const SCAN_LIMIT = 18

export function useStatInfinitePeriods(ctx: StatReportContext, options: {
  filterByTypeIds: ComputedRef<TrnId[]>
  isEnabled: ComputedRef<boolean>
}) {
  const trnsStore = useTrnsStore()
  const loadedOffsets = ref<number[]>([ctx.params.statDate.params.value.rangeOffset])
  const isLoading = ref(false)
  const isExhausted = ref(false)
  const nextOffset = ref(ctx.params.statDate.params.value.rangeOffset + 1)

  const baseOffset = computed(() => ctx.params.statDate.params.value.rangeOffset)

  const canScanPeriods = computed(() => {
    const p = ctx.params.statDate.params.value
    return options.isEnabled.value
      && !p.customDate
      && !p.isShowMaxRange
  })

  function rangeForOffset(offset: number): Range {
    return computeDateRange({
      ...ctx.params.statDate.params.value,
      intervalSelected: -1,
      rangeOffset: offset,
    }, ctx.params.statDate.maxRange.value, Date.now())
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
    const periodIds = idsForRange(range)
    return filterAvailableTrnIds(periodIds, options.filterByTypeIds.value)
  }

  const periods = computed(() => loadedOffsets.value.map(offset => ({
    ids: filteredIdsForRange(rangeForOffset(offset)),
    offset,
    range: rangeForOffset(offset),
  })))
  const isBasePeriodEmpty = computed(() => periods.value[0]?.ids.length === 0)
  const loadedTrnIds = computed(() => periods.value.flatMap(period => period.ids))
  const canLoadMore = computed(() =>
    canScanPeriods.value
    && !isExhausted.value
    && hasUnloadedTrnIds(options.filterByTypeIds.value, loadedTrnIds.value),
  )

  const rows = computed<StatVirtualRow[]>(() => {
    const result: StatVirtualRow[] = []

    for (const period of periods.value) {
      result.push({
        id: `period-anchor-${period.offset}`,
        offset: period.offset,
        type: 'periodAnchor',
      })

      result.push(...buildTrnsDisplayRows(period.ids, trnsStore.items, { idPrefix: `${period.offset}-` })
        .map(row => ({ ...row, offset: period.offset })))
    }

    result.push(!canLoadMore.value ? { id: 'end', type: 'end' } : { id: 'loader', type: 'loader' })
    return result
  })

  function reset() {
    loadedOffsets.value = [baseOffset.value]
    isExhausted.value = false
    nextOffset.value = baseOffset.value + 1
    ctx.params.statDate.clearScrollRangeOffset()
  }

  function loadMore() {
    if (!canLoadMore.value || isLoading.value || isExhausted.value)
      return

    isLoading.value = true
    try {
      let candidate = Math.max(nextOffset.value, Math.max(...loadedOffsets.value) + 1)
      for (let i = 0; i < SCAN_LIMIT; i++) {
        const range = rangeForOffset(candidate)
        if (range.end < ctx.params.statDate.maxRange.value.start) {
          isExhausted.value = true
          return
        }

        if (filteredIdsForRange(range).length > 0) {
          loadedOffsets.value = [...loadedOffsets.value, candidate]
          nextOffset.value = candidate + 1
          return
        }

        candidate++
      }
      nextOffset.value = candidate
    }
    finally {
      isLoading.value = false
    }
  }

  function setActiveOffset(offset: number) {
    if (offset === baseOffset.value)
      ctx.params.statDate.clearScrollRangeOffset()
    else
      ctx.params.statDate.setScrollRangeOffset(offset)
  }

  return {
    canLoadMore,
    isBasePeriodEmpty,
    isExhausted,
    isLoading,
    loadMore,
    reset,
    rows,
    setActiveOffset,
  }
}
