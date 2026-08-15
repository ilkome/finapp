import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { StatConfigProvider } from '~/components/stat/config/useStatConfig'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useForecastMode } from '~/components/recurrences/useForecastMode'
import { useStatChartWindow } from '~/components/stat/chart/useStatChartWindow'
import { useStatReportChart } from '~/components/stat/report/useStatReportChart'
import { useStatReportData } from '~/components/stat/report/useStatReportData'
import { statDevMetrics } from '~/components/stat/statDevMetrics'

export type UseStatReportParams = {
  applyStatsExclusion?: ComputedRef<boolean>
  filter: FilterProvider
  isDateBounded?: boolean
  statConfig: StatConfigProvider
  statDate: StatDateProvider
  statTab: ComputedRef<StatTabSlug>
  storageKey: ComputedRef<string>
  trnsIds: ComputedRef<TrnId[]>
  type: ComputedRef<SeriesSlugSelected | undefined>
}

export function useStatReport(params: UseStatReportParams) {
  if (import.meta.dev) {
    statDevMetrics.reportContextCount.value++
    if (getCurrentScope())
      onScopeDispose(() => statDevMetrics.reportContextCount.value--)
  }
  const forecastMode = useForecastMode()
  const statItemStorageKey = computed(() =>
    `finapp-${params.statDate.params.value.granularityBy}-${params.storageKey.value}-${params.filter.categoriesIds.value.join(',')}`,
  )
  const filteredType = useStorage<SeriesSlugSelected>(
    `finapp-filtered-type-${params.type.value}-${statItemStorageKey.value}`,
    'netIncome',
  )
  const filteredCategoriesIds = ref<CategoryId[]>([])
  const filteredChildCategoryId = ref<CategoryId>()
  const effectiveFilteredCategoriesIds = computed(() => filteredChildCategoryId.value
    ? [filteredChildCategoryId.value]
    : filteredCategoriesIds.value)

  const chartWindow = useStatChartWindow({ statDate: params.statDate })

  const data = useStatReportData({
    applyStatsExclusion: params.applyStatsExclusion,
    chartIntervals: chartWindow.bufferIntervals,
    effectiveFilteredCategoriesIds,
    filter: params.filter,
    filteredCategoriesIds,
    filteredType,
    forecastMode,
    isDateBounded: params.isDateBounded,
    statDate: params.statDate,
    statTab: params.statTab,
    trnsIds: params.trnsIds,
    type: params.type,
  })
  const chart = useStatReportChart({
    data,
    effectiveFilteredCategoriesIds,
    filteredType,
    forecastMode,
    statConfig: params.statConfig,
    statDate: params.statDate,
    statTab: params.statTab,
    type: params.type,
  })

  function onSetCategoryFilter(categoryId: CategoryId) {
    if (filteredCategoriesIds.value.includes(categoryId)) {
      filteredCategoriesIds.value = []
      filteredChildCategoryId.value = undefined
      return
    }
    filteredCategoriesIds.value = [categoryId]
    filteredChildCategoryId.value = undefined
  }
  function onSetChildCategoryFilter(categoryId: CategoryId) {
    filteredChildCategoryId.value = filteredChildCategoryId.value === categoryId ? undefined : categoryId
  }
  function onClickSumItem(clickedType: SeriesSlugSelected) {
    filteredType.value = clickedType === filteredType.value ? 'netIncome' : clickedType
  }

  return {
    averageTotal: data.averageTotal,
    chartSeries: chart.chartSeries,
    chartWindow,
    chartXAxisLabels: chart.chartXAxisLabels,
    effectiveFilteredCategoriesIds,
    filteredCategoriesIds,
    filteredChildCategoryId,
    filteredType,
    focusedCategoryPieData: chart.focusedCategoryPieData,
    forecastMode,
    forecastRangeTotal: data.forecastRangeTotal,
    isPeriodOneDay: data.isPeriodOneDay,
    onClickSumItem,
    onSetCategoryFilter,
    onSetChildCategoryFilter,
    rangeTotal: data.rangeTotal,
    selectedAndFilteredTrnsIds: data.selectedAndFilteredTrnsIds,
    selectedAndQuickFilteredTrnsIds: data.selectedAndQuickFilteredTrnsIds,
    selectedTrnsIds: data.selectedTrnsIds,
    selectedTypeForSum: data.selectedTypeForSum,
    selectedTypesMapping: data.selectedTypesMapping,
    statExcludedIds: data.statExcludedIds,
    statItemStorageKey,
    summaryCategoryPieData: chart.summaryCategoryPieData,
  }
}
