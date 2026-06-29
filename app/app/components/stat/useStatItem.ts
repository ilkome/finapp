import type { ComputedRef } from 'vue'

import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { StatDateProvider } from '~/components/date/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { CategoryPieDatum } from '~/components/stat/chart/useCategorySeriesBuilder'
import type { FilterProvider } from '~/components/stat/filter/types'
import type { ChartSeries, IntervalData, SeriesSlug, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getTotal } from '~/components/amount/getTotal'
import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useForecastMode } from '~/components/recurrences/useForecastMode'
import { useForecastSeries } from '~/components/recurrences/useForecastSeries'
import { buildCategoriesPieData, buildCategoriesSeries } from '~/components/stat/chart/useCategorySeriesBuilder'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { bucketTrnsByIntervals, computeAverageTotal, isPeriodOneDay as isPeriodOneDayFn } from '~/components/stat/intervals'
import { resolveChartType, resolveGrouped } from '~/components/stat/useStatConfig'
import { getSelectedType, getSelectedTypeForSum, getTypesMapping, getTypesToShow } from '~/components/stat/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type ChartPieGroup = {
  pieData: CategoryPieDatum[]
  type: SeriesSlug
}

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
  const { t } = useI18n()
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const { computeTotalForTrnsIds } = useAmount()
  const { createSeriesItem, withMarkArea } = useStatChart()

  // Forecast layer: future recurrence occurrences bucketed into the same intervals/range, toggled
  // by the global forecastMode (off / separate / merged). See plans/recurrences.md §9.
  const forecastMode = useForecastMode()
  const isForecastOn = computed(() => forecastMode.value !== 'off')
  const forecast = useForecastSeries({
    filter,
    intervals: computed(() => statDate.intervalsInRange.value),
    range: computed(() => statDate.range.value),
  })

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

  // --- Forecast merge: when forecast is on, the chart/category breakdown read a projected dataset
  // (actuals + forecast). Totals keep the actual `rangeTotal` and expose forecast separately so the
  // sum row can render fact / forecast / projected per mode.
  function addTotals(a: TotalReturns, b: TotalReturns): TotalReturns {
    return {
      adjustment: a.adjustment + b.adjustment,
      expense: a.expense + b.expense,
      expenseTransfers: a.expenseTransfers + b.expenseTransfers,
      income: a.income + b.income,
      incomeTransfers: a.incomeTransfers + b.incomeTransfers,
      sum: a.sum + b.sum,
      sumTransfers: a.sumTransfers + b.sumTransfers,
    }
  }

  const mergedItems = computed<Record<TrnId, TrnItem>>(() =>
    isForecastOn.value ? { ...(trnsStore.items ?? {}), ...forecast.forecastItems.value } : (trnsStore.items ?? {}),
  )

  // Total over a merged (actuals + forecast) id set; forecast ids resolve only in `mergedItems`.
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
    const fc = forecast.forecastIntervalsData.value
    return actual.map((a, i) => {
      const f = fc[i]
      return f
        ? { range: a.range, total: addTotals(a.total, f.total), trnsIds: [...a.trnsIds, ...f.trnsIds] }
        : a
    })
  })

  // Dataset the chart + category breakdown consume: projected when forecast is on, else actuals.
  const effectiveIntervals = computed(() => isForecastOn.value ? mergedIntervalsData.value : intervalsDataWithFilteredCategories.value)
  const effectiveItems = computed(() => isForecastOn.value ? mergedItems.value : (trnsStore.items ?? {}))
  const effectiveComputeTotal = computed(() => isForecastOn.value ? computeTotalMerged : computeTotalForTrnsIds)

  // Forecast total for the viewed scope (selected interval, else whole range).
  const forecastRangeTotal = computed<TotalReturns | undefined>(() => {
    if (!isForecastOn.value)
      return undefined
    if (isIntervalSelected.value)
      return forecast.forecastIntervalsData.value[statDate.params.value.intervalSelected]?.total
    return forecast.forecastTotal.value
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

  // Ghost forecast series (separate mode): muted, named "<type> · forecast", same chart type.
  function makeForecastSeries(typeSlug: SeriesSlug, totals: TotalReturns[], chartType: ChartType): ChartSeries {
    return {
      color: 'var(--ui-text-dimmed)',
      data: totals.map(i => Math.abs(i[typeSlug])),
      name: `${t(`money.${typeSlug}`)} · ${t('stat.forecast.short')}`,
      type: chartType,
    }
  }

  const categoriesBreakdownType = computed<SeriesSlug>(() => {
    if (statTab.value === 'expense')
      return 'expense'
    if (statTab.value === 'income')
      return 'income'
    // Split renders one item per type ('expense' / 'income'); follow that prop
    // so each column's donut/bars show its own side.
    if (statTab.value === 'split' && (type.value === 'expense' || type.value === 'income'))
      return type.value
    if (filteredType.value === 'expense' || filteredType.value === 'income')
      return filteredType.value
    return 'expense'
  })

  // Effective filter + grouping for the category breakdown (donut and bars).
  // Selecting a category drills into it: match its leaf (transactible) ids and
  // stop grouping, so a selected parent breaks down into its child slices.
  const categoryBreakdownFilter = computed(() => {
    const ids = filteredCategoriesIds.value
    if (ids.length === 0) {
      return {
        filterCategoriesIds: undefined as CategoryId[] | undefined,
        isGrouped: resolveGrouped(statConfig.config.value.chart.isGrouped, statConfig.config.value.grouping),
      }
    }
    return {
      filterCategoriesIds: categoriesStore.getTransactibleIds(ids),
      isGrouped: false,
    }
  })

  const chartSeries = computed<ChartSeries[]>(() => {
    const intervals = effectiveIntervals.value
    const selectedInterval = intervals[statDate.params.value.intervalSelected]
    // Bar/line series never use the `pie` type; the donut renders from
    // `chartPieGroups`, so collapse pie -> bar for the axis-based series here.
    const rawChartType = resolveChartType(statConfig.config.value.chartType, statConfig.config.value.chart.mode)
    const chartType = rawChartType === 'pie' ? 'bar' : rawChartType

    let baseSeries: ChartSeries[]

    if (statConfig.config.value.chart.mode === 'categories') {
      baseSeries = buildCategoriesSeries({
        categoriesItems: categoriesStore.items ?? {},
        chartType,
        computeTotalForTrnsIds: effectiveComputeTotal.value,
        filterCategoriesIds: categoryBreakdownFilter.value.filterCategoriesIds,
        intervals,
        isGrouped: categoryBreakdownFilter.value.isGrouped,
        trnsItems: effectiveItems.value,
        type: categoriesBreakdownType.value,
      })
    }
    else if (forecastMode.value === 'separate') {
      // Actual series solid + a distinct ghost forecast series per shown type.
      const actualIntervals = intervalsDataWithFilteredCategories.value
      const actualTotals = actualIntervals.map(g => g.total)
      const forecastTotals = forecast.forecastIntervalsData.value.map(g => g.total)
      baseSeries = typesToShow.value.flatMap(t => [
        createSeriesItem(t, actualTotals, computeSeriesAverage(t, actualIntervals)),
        makeForecastSeries(t, forecastTotals, chartType),
      ])
    }
    else {
      const intervalTotals = intervals.map(g => g.total)
      baseSeries = typesToShow.value.map(t =>
        createSeriesItem(t, intervalTotals, computeSeriesAverage(t, intervals)),
      )
    }

    if (!selectedInterval?.range.start || statDate.params.value.intervalSelected < 0)
      return baseSeries

    return withMarkArea(baseSeries, selectedInterval.range.start, chartType)
  })

  const chartXAxisLabels = computed(() =>
    intervalsDataWithFilteredCategories.value.map(i => i.range.start),
  )

  function buildPieGroup(type: SeriesSlug): CategoryPieDatum[] {
    return buildCategoriesPieData({
      categoriesItems: categoriesStore.items ?? {},
      computeTotalForTrnsIds: effectiveComputeTotal.value,
      filterCategoriesIds: categoryBreakdownFilter.value.filterCategoriesIds,
      intervals: effectiveIntervals.value,
      isGrouped: categoryBreakdownFilter.value.isGrouped,
      trnsItems: effectiveItems.value,
      type,
    }, t('stat.config.chart.other'))
  }

  // Summary tab shows expense + income donuts side by side; every other tab
  // shows a single donut for the active breakdown type.
  const chartPieGroups = computed<ChartPieGroup[]>(() => {
    if (statConfig.config.value.chart.mode !== 'categories')
      return []

    if (statTab.value === 'summary') {
      return [
        { pieData: buildPieGroup('expense'), type: 'expense' },
        { pieData: buildPieGroup('income'), type: 'income' },
      ]
    }

    return [{ pieData: buildPieGroup(categoriesBreakdownType.value), type: categoriesBreakdownType.value }]
  })

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
    categoriesBreakdownType,
    chartPieGroups,
    chartSeries,
    chartXAxisLabels,
    filteredCategoriesIds,
    filteredType,
    forecastMode,
    forecastRangeTotal,
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
