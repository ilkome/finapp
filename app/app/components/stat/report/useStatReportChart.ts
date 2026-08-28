import type { ComputedRef, Ref } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { useStatReportData } from '~/components/stat/report/useStatReportData'
import type { ChartSeries, IntervalData, SeriesSlugSelected, StatReportType } from '~/components/stat/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { buildCashflowPieData, hideSingleColorPie } from '~/components/stat/chart/cashflowPie'
import { buildCategoriesPieData, buildCategoriesSeries } from '~/components/stat/chart/categoryBreakdown'
import { useStatChart } from '~/components/stat/chart/useStatChart'
import { applyChartValueDisplay } from '~/components/stat/chart/valueDisplay'

export function useStatReportChart(params: {
  data: ReturnType<typeof useStatReportData>
  effectiveFilteredCategoriesIds: ComputedRef<CategoryId[]>
  filteredType: Ref<SeriesSlugSelected>
  hasQuickCategoryFilter: ComputedRef<boolean>
  reportType: ComputedRef<StatReportType>
  shouldHideSingleColorSummaryPie: ComputedRef<boolean>
  statConfig: StatConfigProvider
  statDate: StatDateProvider
  type: ComputedRef<SeriesSlugSelected | undefined>
}) {
  const { t } = useI18n()
  const categoriesStore = useCategoriesStore()
  const { createAverageMarkLine, createSeriesItem, withMarkArea } = useStatChart()

  const categoriesBreakdownType = computed<SeriesSlugSelected>(() => {
    if (params.reportType.value === 'expense')
      return 'expense'
    if (params.reportType.value === 'income')
      return 'income'
    if (params.filteredType.value === 'expense' || params.filteredType.value === 'income')
      return params.filteredType.value
    return 'net'
  })
  const isCategorySumFocused = computed(() =>
    params.reportType.value === 'combined'
    && !params.type.value
    && (params.filteredType.value === 'expense' || params.filteredType.value === 'income'),
  )
  const categoryBreakdownFilter = computed(() => {
    const ids = params.effectiveFilteredCategoriesIds.value
    return {
      filterCategoriesIds: ids.length === 0 ? undefined : categoriesStore.getTransactibleIds(ids),
      isGrouped: true,
    }
  })

  function computeSeriesAverage(typeSlug: SeriesSlugSelected, intervals: IntervalData[]): number | false {
    if (!params.statConfig.config.value.chart.isShowAverage || intervals.length === 0)
      return false
    return intervals.reduce((total, interval) => total + interval.total[typeSlug], 0) / intervals.length
  }

  const chartSeries = computed<ChartSeries[]>(() => {
    const intervals = params.data.chartEffectiveIntervals.value
    const selectedInterval = params.statDate.selectedInterval.value
    const chartType = params.statConfig.config.value.chart.type
    const hasBothQuickCategoryTypes = params.hasQuickCategoryFilter.value
      && intervals.some(interval => interval.total.expense > 0)
      && intervals.some(interval => interval.total.income > 0)
    const shouldUseQuickCategoryCashflow = params.reportType.value === 'combined'
      && !params.type.value
      && hasBothQuickCategoryTypes
      && (chartType === 'bar' || chartType === 'pie')
    let series: ChartSeries[]

    if (!shouldUseQuickCategoryCashflow && (params.statConfig.config.value.chart.breakdown === 'categories' || isCategorySumFocused.value)) {
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
      const average = computeSeriesAverage(categoriesBreakdownType.value, intervals)
      if (average && series[0]) {
        const markLineValueType = categoriesBreakdownType.value === 'net'
          ? average < 0 ? 'expense' : 'income'
          : categoriesBreakdownType.value
        series[0] = {
          ...series[0],
          averageMode: 'stack',
          markLine: createAverageMarkLine(average, series[0].color),
          markLineValueType,
        }
      }
    }
    else {
      const totals = intervals.map(interval => interval.total)
      const typesToShow = shouldUseQuickCategoryCashflow
        ? ['income', 'expense'] as const
        : params.data.typesToShow.value
      series = typesToShow.map(typeSlug =>
        createSeriesItem(typeSlug, totals, computeSeriesAverage(typeSlug, intervals)),
      )
    }

    const displayedSeries = applyChartValueDisplay(series, params.statConfig.config.value.chart.valueDisplay)
    return chartType !== 'pie' && selectedInterval?.start && params.statDate.params.value.intervalSelected >= 0
      ? withMarkArea(displayedSeries, selectedInterval.start, chartType)
      : displayedSeries
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
  const summaryCategoryPieData = computed(() => {
    const expense = buildCategoryPieData('expense')
    const income = buildCategoryPieData('income')
    return {
      expense: params.shouldHideSingleColorSummaryPie.value ? hideSingleColorPie(expense) : expense,
      income: params.shouldHideSingleColorSummaryPie.value ? hideSingleColorPie(income) : income,
      net: buildCashflowPieData(params.data.rangeTotal.value),
    }
  })
  const focusedCategoryPieData = computed(() => {
    if (params.filteredType.value !== 'expense' && params.filteredType.value !== 'income')
      return []
    return buildCategoryPieData(params.filteredType.value)
  })

  return { categoriesBreakdownType, chartSeries, chartXAxisLabels, focusedCategoryPieData, summaryCategoryPieData }
}
