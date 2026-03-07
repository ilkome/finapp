import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { ChartSeries, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
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
  const { getTotalOfTrnsIds } = useAmount()
  const { addMarkArea, createSeriesItem } = useStatChart()

  const newBaseStorageKey = computed(() =>
    `finapp-${statDate.params.value.intervalsBy}-${storageKey.value}-${JSON.stringify(filter?.categoriesIds?.value)}`,
  )

  const filteredType = useStorage<SeriesSlugSelected>(
    `finapp-filtered-type-${type.value}-${newBaseStorageKey.value}`,
    'netIncome',
  )

  const filteredCategoriesIds = ref<CategoryId[]>([])

  const selectedType = computed(() => getSelectedType(statTab.value, filteredType.value, type.value))
  const selectedTypeForSum = computed(() => getSelectedTypeForSum(statTab.value, type.value))
  const selectedTypesMapping = computed(() => getTypesMapping(selectedType.value))

  const isPeriodOneDay = computed(() => isPeriodOneDayFn(statDate.params.value))

  const rangeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    trnsIds: trnsIds.value,
  }))

  const rangeTrnsIdsWithFilteredCategories = computed(() => trnsStore.getStoreTrnsIds({
    categoriesIds: filteredCategoriesIds.value,
    trnsIds: trnsIds.value,
  }))

  const intervalsData = computed(() =>
    bucketTrnsByIntervals(trnsStore.items ?? {}, rangeTrnsIds.value, statDate.intervalsInRange.value, getTotalOfTrnsIds),
  )

  const intervalsDataWithFilteredCategories = computed(() =>
    bucketTrnsByIntervals(trnsStore.items ?? {}, rangeTrnsIdsWithFilteredCategories.value, statDate.intervalsInRange.value, getTotalOfTrnsIds),
  )

  const selectedTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    sort: true,
    trnsIds: statDate.params.value.intervalSelected !== -1
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
    trnsTypes: selectedTypesMapping.value,
  }))

  const selectedAndFilteredTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    categoriesIds: filteredCategoriesIds.value,
    sort: true,
    trnsIds: statDate.params.value.intervalSelected !== -1
      ? intervalsData.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIds.value,
    trnsTypes: selectedTypesMapping.value,
  }))

  const rangeTotal = computed(() => {
    const ids = statDate.params.value.intervalSelected !== -1
      ? intervalsDataWithFilteredCategories.value[statDate.params.value.intervalSelected]?.trnsIds
      : rangeTrnsIdsWithFilteredCategories.value
    return getTotalOfTrnsIds(ids)
  })

  const averageTotal = computed(() => {
    if (differenceInDays(statDate.range.value.end, statDate.range.value.start) < 2)
      return

    const sum = filteredType.value === 'netIncome' ? rangeTotal.value.sum : rangeTotal.value[type.value!]

    const dateRange = statDate.params.value.intervalSelected !== -1
      ? statDate.selectedInterval.value
      : statDate.range.value

    return computeAverageTotal(sum, dateRange!)
  })

  const typesToShow = computed(() => getTypesToShow(statTab.value, filteredType.value, type.value))

  const chartSeries = computed<ChartSeries[]>(() => {
    const intervalTotals = intervalsDataWithFilteredCategories.value.map(g => g.total)
    const baseSeries = typesToShow.value.map(t =>
      createSeriesItem(
        t,
        intervalTotals,
        statConfig.config.value.chart.isShowAverage
          ? intervalsDataWithFilteredCategories.value.reduce((acc, i) => acc + i.total[t], 0) / intervalsData.value.length
          : false,
      ),
    )

    const selectedInterval = intervalsDataWithFilteredCategories.value?.[statDate.params.value.intervalSelected]
    if (!selectedInterval?.range.start || statDate.params.value.intervalSelected < 0)
      return baseSeries

    return addMarkArea(baseSeries, selectedInterval.range.start, statConfig.config.value?.chartType)
  })

  const chartXAxisLabels = computed(() =>
    intervalsDataWithFilteredCategories.value.map(i => +i.range.start),
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
    newBaseStorageKey,
    onClickSumItem,
    onSetCategoryFilter,
    rangeTotal,
    selectedAndFilteredTrnsIds,
    selectedTrnsIds,
    selectedTypeForSum,
  }
}
