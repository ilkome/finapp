import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'
import { differenceInDays, differenceInMonths, differenceInWeeks } from 'date-fns'

import type { CategoryId } from '~/components/categories/types'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { ChartSeries, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { getTypesMapping } from '~/components/stat/utils'
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

  const selectedType = computed(() => {
    if (statTab.value === 'summary')
      return filteredType.value
    if (statTab.value === 'split')
      return type.value
    return statTab.value
  })

  const selectedTypeForSum = computed(() => {
    if (statTab.value === 'summary')
      return 'summary'
    if (statTab.value === 'split')
      return type.value
    return statTab.value
  })

  const selectedTypesMapping = computed(() => getTypesMapping(selectedType.value))

  const isPeriodOneDay = computed(() =>
    (statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1)
    || (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalSelected !== -1),
  )

  const rangeTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    trnsIds: trnsIds.value,
  }))

  const rangeTrnsIdsWithFilteredCategories = computed(() => trnsStore.getStoreTrnsIds({
    categoriesIds: filteredCategoriesIds.value,
    trnsIds: trnsIds.value,
  }))

  function getIntervalsData(ids: TrnId[], intervalsInRange: Range[]) {
    if (!intervalsInRange.length)
      return []

    // Pre-allocate one bucket per interval
    const buckets: TrnId[][] = intervalsInRange.map(() => [])

    // Single pass over trns — binary search for the matching interval
    for (const id of ids) {
      const trnDate = trnsStore.items?.[id]?.date
      if (trnDate == null)
        continue

      let lo = 0
      let hi = intervalsInRange.length - 1
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        if (trnDate < intervalsInRange[mid].start) {
          hi = mid - 1
        }
        else if (trnDate > intervalsInRange[mid].end) {
          lo = mid + 1
        }
        else {
          buckets[mid].push(id)
          break
        }
      }
    }

    return intervalsInRange.map((range, i) => ({
      range,
      total: getTotalOfTrnsIds(buckets[i]),
      trnsIds: buckets[i],
    }))
  }

  const intervalsData = computed(() => getIntervalsData(rangeTrnsIds.value, statDate.intervalsInRange.value))
  const intervalsDataWithFilteredCategories = computed(() => getIntervalsData(rangeTrnsIdsWithFilteredCategories.value, statDate.intervalsInRange.value))

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

    const sum = filteredType.value === 'netIncome' ? rangeTotal.value.sum : rangeTotal.value[type.value]

    const date = statDate.params.value.intervalSelected !== -1
      ? statDate.selectedInterval.value
      : statDate.range.value

    const dif = {
      day: differenceInDays(date?.end, date?.start) + 1,
      month: differenceInMonths(date?.end, date?.start) + 1,
      week: differenceInWeeks(date?.end, date?.start) + 1,
    }

    const items = {
      month: 0,
      week: 0,
      // eslint-disable-next-line perfectionist/sort-objects
      day: 0,
    }

    if (dif.month > 1)
      items.month = sum / dif.month
    if (dif.day > 1)
      items.day = sum / dif.day
    if (dif.week > 1)
      items.week = sum / dif.week

    return Object.fromEntries(Object.entries(items).filter(([_, value]) => value !== 0))
  })

  const typesToShow = computed(() => {
    if (statTab.value === 'summary') {
      if (filteredType.value === 'netIncome')
        return ['income', 'expense']
      if (filteredType.value === 'income')
        return ['income']
      if (filteredType.value === 'expense')
        return ['expense']
    }

    if (statTab.value === 'expense' || statTab.value === 'income')
      return [statTab.value]

    return [type.value]
  })

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
