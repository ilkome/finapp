import type { ComputedRef, Ref } from 'vue'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { ForecastMode } from '~/components/recurrences/useForecastMode'
import type { StatConfigProvider } from '~/components/stat/config/useStatConfig'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { useStatReportData } from '~/components/stat/report/useStatReportData'
import type { ChartSeries, IntervalData, SeriesSlug, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildCategoriesPieData, buildCategoriesSeries } from '~/components/stat/chart/categoryBreakdown'
import { useStatChart } from '~/components/stat/chart/useStatChart'

export function useStatReportChart(params: {
  data: ReturnType<typeof useStatReportData>
  effectiveFilteredCategoriesIds: ComputedRef<CategoryId[]>
  filteredType: Ref<SeriesSlugSelected>
  forecastMode: Ref<ForecastMode>
  statConfig: StatConfigProvider
  statDate: StatDateProvider
  statTab: ComputedRef<StatTabSlug>
  type: ComputedRef<SeriesSlugSelected | undefined>
}) {
  const { t } = useI18n()
  const categoriesStore = useCategoriesStore()
  const { createSeriesItem, withMarkArea } = useStatChart()

  const categoriesBreakdownType = computed<SeriesSlug>(() => {
    if (params.statTab.value === 'expense')
      return 'expense'
    if (params.statTab.value === 'income')
      return 'income'
    if (params.statTab.value === 'split' && (params.type.value === 'expense' || params.type.value === 'income'))
      return params.type.value
    if (params.filteredType.value === 'expense' || params.filteredType.value === 'income')
      return params.filteredType.value
    return 'expense'
  })
  const isCategorySumFocused = computed(() =>
    params.statTab.value === 'summary'
    && !params.type.value
    && (params.filteredType.value === 'expense' || params.filteredType.value === 'income'),
  )
  const categoryBreakdownFilter = computed(() => {
    const ids = params.effectiveFilteredCategoriesIds.value
    return ids.length === 0
      ? { filterCategoriesIds: undefined, isGrouped: params.statConfig.config.value.chart.isGrouped }
      : { filterCategoriesIds: categoriesStore.getTransactibleIds(ids), isGrouped: false }
  })

  function computeSeriesAverage(typeSlug: SeriesSlug, intervals: IntervalData[]): number | false {
    if (!params.statConfig.config.value.chart.isShowAverage || intervals.length === 0)
      return false
    return intervals.reduce((total, interval) => total + interval.total[typeSlug], 0) / intervals.length
  }

  function makeForecastSeries(typeSlug: SeriesSlug, totals: TotalReturns[]): ChartSeries {
    return {
      color: 'var(--ui-text-dimmed)',
      data: totals.map(total => Math.abs(total[typeSlug])),
      name: `${t(`money.${typeSlug}`)} · ${t('stat.forecast.short')}`,
      type: params.statConfig.config.value.chart.type,
    }
  }

  const chartSeries = computed<ChartSeries[]>(() => {
    const intervals = params.data.chartEffectiveIntervals.value
    const selectedInterval = params.statDate.selectedInterval.value
    const chartType = params.statConfig.config.value.chart.type
    let series: ChartSeries[]

    if (params.statConfig.config.value.chart.isByCategories || isCategorySumFocused.value) {
      series = buildCategoriesSeries({
        categoriesItems: categoriesStore.items ?? {},
        chartType,
        computeTotalForTrnsIds: params.data.chartEffectiveComputeTotal.value,
        excludedCategoriesIds: params.data.statExcludedIds.value,
        filterCategoriesIds: categoryBreakdownFilter.value.filterCategoriesIds,
        intervals,
        isGrouped: categoryBreakdownFilter.value.isGrouped,
        otherName: t('stat.config.chart.other'),
        trnsItems: params.data.chartEffectiveItems.value,
        type: categoriesBreakdownType.value,
      })
    }
    else if (params.forecastMode.value === 'separate') {
      const actualIntervals = params.data.chartIntervalsDataWithFilteredCategories.value
      const actualTotals = actualIntervals.map(interval => interval.total)
      const forecastTotals = params.data.chartForecast.forecastIntervalsData.value.map(interval => interval.total)
      series = params.data.typesToShow.value.flatMap(typeSlug => [
        createSeriesItem(typeSlug, actualTotals, computeSeriesAverage(typeSlug, actualIntervals)),
        makeForecastSeries(typeSlug, forecastTotals),
      ])
    }
    else {
      const totals = intervals.map(interval => interval.total)
      series = params.data.typesToShow.value.map(typeSlug =>
        createSeriesItem(typeSlug, totals, computeSeriesAverage(typeSlug, intervals)),
      )
    }

    return selectedInterval?.start && params.statDate.params.value.intervalSelected >= 0
      ? withMarkArea(series, selectedInterval.start, chartType)
      : series
  })
  const chartXAxisLabels = computed(() =>
    params.data.chartIntervalsDataWithFilteredCategories.value.map(interval => interval.range.start),
  )
  function buildCategoryPieData(type: 'expense' | 'income') {
    const intervals = params.data.isIntervalSelected.value
      ? [params.data.intervalsDataWithFilteredCategories.value[params.statDate.params.value.intervalSelected]!]
      : params.data.intervalsDataWithFilteredCategories.value
    return buildCategoriesPieData({
      categoriesItems: categoriesStore.items ?? {},
      computeTotalForTrnsIds: params.data.computeTotalForTrnsIds,
      excludedCategoriesIds: params.data.statExcludedIds.value,
      filterCategoriesIds: categoryBreakdownFilter.value.filterCategoriesIds,
      intervals,
      isGrouped: categoryBreakdownFilter.value.isGrouped,
      trnsItems: params.data.trnsItems.value,
      type,
    })
  }
  const summaryCategoryPieData = computed(() => ({
    expense: buildCategoryPieData('expense'),
    income: buildCategoryPieData('income'),
  }))
  const focusedCategoryPieData = computed(() => {
    if (params.filteredType.value !== 'expense' && params.filteredType.value !== 'income')
      return []
    return buildCategoryPieData(params.filteredType.value)
  })

  return { categoriesBreakdownType, chartSeries, chartXAxisLabels, focusedCategoryPieData, summaryCategoryPieData }
}
