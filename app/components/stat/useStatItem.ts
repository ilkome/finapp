import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { ChartSeries, IntervalData, SeriesSlug, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { bucketTrnsByIntervals, computeAverageTotal, isPeriodOneDay as isPeriodOneDayFn } from '~/components/stat/intervals'
import { getSelectedType, getSelectedTypeForSum, getTypesMapping, getTypesToShow } from '~/components/stat/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type UseStatItemParams = {
  filter: FilterProvider
  statConfig: StatConfigProvider
  statDate: StatDateProvider
  statTab: ComputedRef<StatTabSlug>
  storageKey: ComputedRef<string>
  trnsIds: ComputedRef<TrnId[]>
  type: ComputedRef<SeriesSlugSelected | undefined>
}

export function useStatItem({
  filter,
  statConfig,
  statDate,
  statTab,
  storageKey,
  trnsIds,
  type,
}: UseStatItemParams) {
  const trnsStore = useTrnsStore()
  const { computeTotalForTrnsIds } = useAmount()
  const { createSeriesItem, withMarkArea } = useStatChart()

  const statItemStorageKey = computed(() =>
    `finapp-${statDate.params.value.intervalsBy}-${storageKey.value}-${(filter?.categoriesIds?.value ?? []).join(',')}`,
  )

  const filteredType = useStorage<SeriesSlugSelected>(
    `finapp-filtered-type-${type.value}-${statItemStorageKey.value}`,
    'netIncome',
  )

  const filteredCategoriesIds = ref<CategoryId[]>([])

  const selectedType = computed(() => getSelectedType(statTab.value, filteredType.value, type.value))
  const selectedTypeForSum = computed(() => getSelectedTypeForSum(statTab.value, type.value))
  const selectedTypesMapping = computed(() => getTypesMapping(selectedType.value))

  const isPeriodOneDay = computed(() => isPeriodOneDayFn(statDate.params.value))
  const isIntervalSelected = computed(() => statDate.params.value.intervalSelected >= 0)

  const rangeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    trnsIds: trnsIds.value,
  }))

  const hasCategoryFilter = computed(() => filteredCategoriesIds.value.length > 0)

  const rangeTrnsIdsWithFilteredCategories = computed(() => {
    if (!hasCategoryFilter.value)
      return rangeTrnsIds.value
    return trnsStore.getStoreTrnsIds({
      categoriesIds: filteredCategoriesIds.value,
      trnsIds: trnsIds.value,
    })
  })

  const intervalsData = computed(() =>
    bucketTrnsByIntervals(trnsStore.items ?? {}, rangeTrnsIds.value, statDate.intervalsInRange.value, computeTotalForTrnsIds),
  )

  const intervalsDataWithFilteredCategories = computed(() => {
    if (!hasCategoryFilter.value)
      return intervalsData.value
    return bucketTrnsByIntervals(trnsStore.items ?? {}, rangeTrnsIdsWithFilteredCategories.value, statDate.intervalsInRange.value, computeTotalForTrnsIds)
  })

  const baseTrnsIdsForSelection = computed(() =>
    isIntervalSelected.value
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
  )

  const selectedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    sort: true,
    trnsIds: baseTrnsIdsForSelection.value,
    trnsTypes: selectedTypesMapping.value,
  }))

  const selectedAndFilteredTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    categoriesIds: filteredCategoriesIds.value,
    sort: true,
    trnsIds: baseTrnsIdsForSelection.value,
    trnsTypes: selectedTypesMapping.value,
  }))

  const rangeTotal = computed(() => {
    const ids = isIntervalSelected.value
      ? intervalsDataWithFilteredCategories.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIdsWithFilteredCategories.value
    return computeTotalForTrnsIds(ids)
  })

  const averageTotal = computed(() => {
    if (differenceInDays(statDate.range.value.end, statDate.range.value.start) < 2)
      return

    const key: keyof TotalReturns = (!type.value || type.value === 'netIncome' || filteredType.value === 'netIncome') ? 'sum' : type.value
    const sum = rangeTotal.value[key] ?? 0

    const dateRange = isIntervalSelected.value
      ? statDate.selectedInterval.value
      : statDate.range.value

    return computeAverageTotal(sum, dateRange!)
  })

  const typesToShow = computed(() => getTypesToShow(statTab.value, filteredType.value, type.value))

  function computeSeriesAverage(typeSlug: SeriesSlug, intervals: IntervalData[]): number | false {
    if (!statConfig.config.value.chart.isShowAverage || intervals.length === 0)
      return false
    return intervals.reduce((acc, i) => acc + i.total[typeSlug], 0) / intervals.length
  }

  const chartSeries = computed<ChartSeries[]>(() => {
    const intervals = intervalsDataWithFilteredCategories.value
    const intervalTotals = intervals.map(g => g.total)

    const baseSeries = typesToShow.value.map(t =>
      createSeriesItem(t, intervalTotals, computeSeriesAverage(t, intervals)),
    )

    const selectedInterval = intervals[statDate.params.value.intervalSelected]
    if (!selectedInterval?.range.start || statDate.params.value.intervalSelected < 0)
      return baseSeries

    return withMarkArea(baseSeries, selectedInterval.range.start, statConfig.config.value?.chartType)
  })

  const chartXAxisLabels = computed(() =>
    intervalsDataWithFilteredCategories.value.map(i => i.range.start),
  )

  function onSetCategoryFilter(categoryId: CategoryId) {
    if (filteredCategoriesIds.value.includes(categoryId)) {
      filteredCategoriesIds.value = []
      return
    }
    filteredCategoriesIds.value = [categoryId]
  }

  function onClickSumItem(clickedType: SeriesSlugSelected) {
    filteredType.value = clickedType === filteredType.value ? 'netIncome' : clickedType
  }

  return {
    averageTotal,
    chartSeries,
    chartXAxisLabels,
    filteredCategoriesIds,
    filteredType,
    isPeriodOneDay,
    onClickSumItem,
    onSetCategoryFilter,
    rangeTotal,
    selectedAndFilteredTrnsIds,
    selectedTrnsIds,
    selectedTypeForSum,
    statItemStorageKey,
  }
}
