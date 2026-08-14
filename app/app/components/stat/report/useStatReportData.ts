import type { ComputedRef, Ref } from 'vue'

import { differenceInDays } from 'date-fns'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { ForecastMode } from '~/components/recurrences/useForecastMode'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { IntervalData, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId, TrnItem, Trns } from '~/components/trns/types'

import { addTotals, getTotal } from '~/components/amount/getTotal'
import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useForecastSeries } from '~/components/recurrences/useForecastSeries'
import { bucketTrnsByIntervals, computeAverageTotal, isPeriodOneDay as isPeriodOneDayFn } from '~/components/stat/intervals'
import { deferStatDevMetricsUpdate, getStatMetricNow, statDevMetrics } from '~/components/stat/statDevMetrics'
import { getSelectedType, getSelectedTypeForSum, getTypesMapping, getTypesToShow } from '~/components/stat/utils'
import { createTrnMatcher } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type StatReportSelection = {
  filteredIds: TrnId[]
  quickFilteredIds: TrnId[]
  selectedIds: TrnId[]
}

export type StatReportSelectedRecord = {
  categoryId: CategoryId
  id: TrnId
}

export function buildSortedStatReportSelection(params: {
  sourceIds: readonly TrnId[] | undefined
  trnsItems: Trns
  trnsTypes: ReturnType<typeof getTypesMapping>
}): StatReportSelectedRecord[] {
  const startedAt = import.meta.dev ? getStatMetricNow() : 0
  const matchesType = createTrnMatcher({ trnsTypes: params.trnsTypes })
  const candidates = (params.sourceIds ?? [])
    .map(id => ({ id, trn: params.trnsItems[id] }))
    .sort((a, b) => (b.trn?.date ?? 0) - (a.trn?.date ?? 0))
  const selected: StatReportSelectedRecord[] = []
  for (const { id, trn } of candidates) {
    if (!matchesType(trn))
      continue
    selected.push({ categoryId: trn.categoryId, id })
  }

  if (import.meta.dev) {
    const duration = getStatMetricNow() - startedAt
    deferStatDevMetricsUpdate(() => {
      statDevMetrics.reportSelectionCount.value++
      statDevMetrics.reportSelectionDuration.value = duration
      statDevMetrics.reportSelectionVisitedIds.value = candidates.length
    })
  }
  return selected
}

export function projectStatReportSelection(
  selected: readonly StatReportSelectedRecord[],
  effectiveCategoryIds: readonly CategoryId[],
  quickCategoryIds: readonly CategoryId[],
): StatReportSelection {
  const selectedIds: TrnId[] = []
  const filteredIds: TrnId[] = []
  const quickFilteredIds: TrnId[] = []
  const effectiveSet = effectiveCategoryIds.length ? new Set(effectiveCategoryIds) : null
  const quickSet = quickCategoryIds.length ? new Set(quickCategoryIds) : null
  for (const { categoryId, id } of selected) {
    selectedIds.push(id)
    if (!effectiveSet || effectiveSet.has(categoryId))
      filteredIds.push(id)
    if (!quickSet || quickSet.has(categoryId))
      quickFilteredIds.push(id)
  }
  return { filteredIds, quickFilteredIds, selectedIds }
}

export function buildStatReportSelection(params: {
  effectiveCategoryIds: CategoryId[]
  quickCategoryIds: CategoryId[]
  sourceIds: readonly TrnId[] | undefined
  trnsItems: Trns
  trnsTypes: ReturnType<typeof getTypesMapping>
}): StatReportSelection {
  return projectStatReportSelection(
    buildSortedStatReportSelection(params),
    params.effectiveCategoryIds,
    params.quickCategoryIds,
  )
}

export function useStatReportData(params: {
  applyStatsExclusion?: ComputedRef<boolean>
  effectiveFilteredCategoriesIds: ComputedRef<CategoryId[]>
  filter: FilterProvider
  filteredCategoriesIds: Ref<CategoryId[]>
  filteredType: Ref<SeriesSlugSelected>
  forecastMode: Ref<ForecastMode>
  isDateBounded?: boolean
  statDate: StatDateProvider
  statTab: ComputedRef<StatTabSlug>
  trnsIds: ComputedRef<TrnId[]>
  type: ComputedRef<SeriesSlugSelected | undefined>
}) {
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const { computeTotalForTrnsIds } = useAmount()
  const isForecastOn = computed(() => params.forecastMode.value !== 'off')
  const forecast = useForecastSeries({
    filter: params.filter,
    intervals: computed(() => params.statDate.intervalsInRange.value),
    range: computed(() => params.statDate.range.value),
  })

  const selectedType = computed(() => getSelectedType(params.statTab.value, params.filteredType.value, params.type.value))
  const selectedTypeForSum = computed(() => getSelectedTypeForSum(params.statTab.value, params.type.value))
  const selectedTypesMapping = computed(() => getTypesMapping(selectedType.value))
  const typesToShow = computed(() => getTypesToShow(params.statTab.value, params.filteredType.value, params.type.value))
  const isPeriodOneDay = computed(() => isPeriodOneDayFn(params.statDate.params.value))
  const isIntervalSelected = computed(() => params.statDate.params.value.intervalSelected >= 0)
  const rangeTrnsIds = computed(() => {
    if (params.isDateBounded)
      return params.trnsIds.value
    if (import.meta.dev) {
      deferStatDevMetricsUpdate(() => {
        statDevMetrics.getStoreTrnsIdsCount.value++
      })
    }
    return trnsStore.getStoreTrnsIds({ dates: params.statDate.range.value, trnsIds: params.trnsIds.value })
  })
  const hasCategoryFilter = computed(() => params.effectiveFilteredCategoriesIds.value.length > 0)
  const rangeTrnsIdsWithFilteredCategories = computed(() => {
    if (!hasCategoryFilter.value)
      return rangeTrnsIds.value
    if (import.meta.dev) {
      deferStatDevMetricsUpdate(() => {
        statDevMetrics.getStoreTrnsIdsCount.value++
      })
    }
    return trnsStore.getStoreTrnsIds({ categoriesIds: params.effectiveFilteredCategoriesIds.value, trnsIds: rangeTrnsIds.value })
  })
  const statExcludedIds = computed<ReadonlySet<CategoryId> | undefined>(() =>
    params.applyStatsExclusion?.value && !hasCategoryFilter.value ? categoriesStore.excludedFromStatsIds : undefined,
  )

  function computeTotalForStat(ids?: TrnId[]): TotalReturns {
    if (!statExcludedIds.value)
      return computeTotalForTrnsIds(ids)
    return getTotal({
      baseCurrencyCode: currenciesStore.base,
      excludedCategoriesIds: statExcludedIds.value,
      rates: currenciesStore.rates,
      trnsIds: ids,
      trnsItems: trnsStore.items ?? {},
      walletsItems: walletsStore.items ?? {},
    })
  }

  const intervalsData = computed(() => bucketTrnsByIntervals(
    trnsStore.items ?? {},
    rangeTrnsIds.value,
    params.statDate.intervalsInRange.value,
    computeTotalForStat,
  ))
  const intervalsDataWithFilteredCategories = computed(() => hasCategoryFilter.value
    ? bucketTrnsByIntervals(
        trnsStore.items ?? {},
        rangeTrnsIdsWithFilteredCategories.value,
        params.statDate.intervalsInRange.value,
        computeTotalForTrnsIds,
      )
    : intervalsData.value)

  const mergedItems = computed<Record<TrnId, TrnItem>>(() => isForecastOn.value
    ? { ...(trnsStore.items ?? {}), ...forecast.forecastItems.value }
    : (trnsStore.items ?? {}))
  function computeTotalMerged(ids?: TrnId[]): TotalReturns {
    return getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds: ids,
      trnsItems: mergedItems.value,
      walletsItems: walletsStore.items ?? {},
    })
  }
  const mergedIntervalsData = computed<IntervalData[]>(() => {
    const actual = intervalsDataWithFilteredCategories.value
    if (!isForecastOn.value)
      return actual
    return actual.map((item, index) => {
      const forecastItem = forecast.forecastIntervalsData.value[index]
      return forecastItem
        ? { range: item.range, total: addTotals(item.total, forecastItem.total), trnsIds: [...item.trnsIds, ...forecastItem.trnsIds] }
        : item
    })
  })
  const effectiveIntervals = computed(() => isForecastOn.value ? mergedIntervalsData.value : intervalsDataWithFilteredCategories.value)
  const effectiveItems = computed(() => isForecastOn.value ? mergedItems.value : (trnsStore.items ?? {}))
  const effectiveComputeTotal = computed(() => isForecastOn.value ? computeTotalMerged : computeTotalForTrnsIds)
  const forecastRangeTotal = computed<TotalReturns | undefined>(() => {
    if (!isForecastOn.value)
      return undefined
    return isIntervalSelected.value
      ? forecast.forecastIntervalsData.value[params.statDate.params.value.intervalSelected]?.total
      : forecast.forecastTotal.value
  })
  const baseTrnsIdsForSelection = computed(() => isIntervalSelected.value
    ? intervalsData.value[params.statDate.params.value.intervalSelected]?.trnsIds
    : rangeTrnsIds.value)
  const sortedSelection = computed(() => buildSortedStatReportSelection({
    sourceIds: baseTrnsIdsForSelection.value,
    trnsItems: trnsStore.items ?? {},
    trnsTypes: selectedTypesMapping.value,
  }))
  const selection = computed(() => projectStatReportSelection(
    sortedSelection.value,
    categoriesStore.getTransactibleIds(params.effectiveFilteredCategoriesIds.value),
    categoriesStore.getTransactibleIds(params.filteredCategoriesIds.value),
  ))
  const selectedTrnsIds = computed(() => selection.value.selectedIds)
  const selectedAndFilteredTrnsIds = computed(() => selection.value.filteredIds)
  const selectedAndQuickFilteredTrnsIds = computed(() => selection.value.quickFilteredIds)
  const rangeTotal = computed(() => {
    const ids = isIntervalSelected.value
      ? intervalsDataWithFilteredCategories.value[params.statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIdsWithFilteredCategories.value
    return computeTotalForStat(ids)
  })
  const averageTotal = computed(() => {
    if (differenceInDays(params.statDate.range.value.end, params.statDate.range.value.start) < 2)
      return
    const key: keyof TotalReturns = (!params.type.value || params.type.value === 'netIncome' || params.filteredType.value === 'netIncome')
      ? 'sum'
      : params.type.value
    const dateRange = isIntervalSelected.value ? params.statDate.selectedInterval.value : params.statDate.range.value
    return computeAverageTotal(rangeTotal.value[key] ?? 0, dateRange!)
  })

  return {
    averageTotal,
    computeTotalForTrnsIds,
    effectiveComputeTotal,
    effectiveIntervals,
    effectiveItems,
    forecast,
    forecastRangeTotal,
    intervalsDataWithFilteredCategories,
    isIntervalSelected,
    isPeriodOneDay,
    rangeTotal,
    selectedAndFilteredTrnsIds,
    selectedAndQuickFilteredTrnsIds,
    selectedTrnsIds,
    selectedTypeForSum,
    selectedTypesMapping,
    statExcludedIds,
    trnsItems: computed(() => trnsStore.items ?? {}),
    typesToShow,
  }
}
