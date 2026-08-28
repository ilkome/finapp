import { useStorage } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, UseStatReportParams } from '~/components/stat/types'
import type { TrnsListFilterState } from '~/components/trns/types'

import { useStatChartWindow } from '~/components/stat/chart/useStatChartWindow'
import { useStatReportChart } from '~/components/stat/report/useStatReportChart'
import { useStatReportData } from '~/components/stat/report/useStatReportData'
import { statDevMetrics } from '~/components/stat/statDevMetrics'

export function normalizeSelectedSeries(value: unknown): SeriesSlugSelected {
  if (value === 'expense' || value === 'income' || value === 'net')
    return value
  return 'net'
}

export function useStatReport(params: UseStatReportParams) {
  if (import.meta.dev) {
    statDevMetrics.reportContextCount.value++
    if (getCurrentScope())
      onScopeDispose(() => statDevMetrics.reportContextCount.value--)
  }
  const trnsViewState: TrnsListFilterState = params.trnsViewState ?? {
    filterBy: ref('all'),
    isShowHistoryWithDesc: ref(false),
    isShowWithDesc: ref(false),
  }
  const statItemStorageKey = computed(() =>
    `finapp-${params.statDate.params.value.granularityBy}-${params.storageKey.value}-${params.filter.categoriesIds.value.join(',')}`,
  )
  const filteredType = useStorage<SeriesSlugSelected>(
    `finapp-filtered-type-${params.type.value}-${statItemStorageKey.value}`,
    params.initialFilteredType ?? 'net',
  )
  if (params.initialFilteredType !== undefined)
    filteredType.value = normalizeSelectedSeries(params.initialFilteredType)
  const normalizedFilteredType = normalizeSelectedSeries(filteredType.value)
  if (filteredType.value !== normalizedFilteredType)
    filteredType.value = normalizedFilteredType
  const filteredCategoriesIds = params.quickCategoryFilter?.categoriesIds ?? ref<CategoryId[]>([])
  const filteredChildCategoryId = params.quickCategoryFilter?.childCategoryId ?? ref<CategoryId>()
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
    isDateBounded: params.isDateBounded,
    reportType: params.reportType,
    selectionSource: params.selectionSource,
    statDate: params.statDate,
    trnsIds: params.trnsIds,
    type: params.type,
  })
  const chart = useStatReportChart({
    data,
    effectiveFilteredCategoriesIds,
    filteredType,
    reportType: params.reportType,
    shouldHideSingleColorSummaryPie: computed(() =>
      filteredCategoriesIds.value.length > 0 || !!params.categoryId?.value,
    ),
    statConfig: params.statConfig,
    statDate: params.statDate,
    type: params.type,
  })

  function onSetCategoryFilter(categoryId: CategoryId) {
    if (params.quickCategoryFilter?.setCategoryFilter) {
      params.quickCategoryFilter.setCategoryFilter(categoryId)
      return
    }
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
    filteredType.value = clickedType === filteredType.value ? 'net' : clickedType
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
    trnsViewState,
  }
}
