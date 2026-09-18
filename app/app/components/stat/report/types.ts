import type { useStatReportContext } from '~/components/stat/useStatReportContext'

export type StatReportContext = ReturnType<typeof useStatReportContext>

type PickCtx<K extends keyof StatReportContext, P extends keyof StatReportContext['params']>
  = Pick<StatReportContext, K> & { params: Pick<StatReportContext['params'], P> }

/**
 * What each report section actually reads; the full context is the producer's concern.
 * Details keeps the full context because it hands it to the trns feed.
 */
export type StatSumsCtx = PickCtx<
  'averageTotal' | 'effectiveChartType' | 'filteredType' | 'focusedCategoryPieData' | 'isCategoryFocus' | 'onClickSumItemWrap' | 'rangeTotal' | 'selectedTypeForSum' | 'shouldShowAmounts' | 'summaryCategoryPieData',
  'categoryId' | 'statConfig' | 'walletId'
>

export type StatChartCtx = PickCtx<
  'chartSeries' | 'chartWindow' | 'chartXAxisLabels' | 'effectiveChartType' | 'shouldShowAmounts',
  'statConfig'
>

export type StatSplitContexts = Record<'expense' | 'income', StatReportContext>

/**
 * `split` exists only while a split layout is on screen; `combined` is always there. The flags
 * say which sections render the pair (page split: sums and blocks, chart split: the chart).
 */
export type StatReportContexts = {
  combined: StatReportContext
  isChartSplit: boolean
  isPageSplit: boolean
  split: StatSplitContexts | null
}
