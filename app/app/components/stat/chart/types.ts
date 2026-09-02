export const chartTypes = ['bar', 'line', 'pie'] as const

export type ChartType = (typeof chartTypes)[number]
export type AxisChartType = Exclude<ChartType, 'pie'>
export type LineChartOptions = {
  isGradient: boolean
  isShowPoints: boolean
  isSkipZero: boolean
  isSmooth: boolean
}

export const defaultLineChartOptions: LineChartOptions = {
  isGradient: false,
  isShowPoints: true,
  isSkipZero: false,
  isSmooth: true,
}

export function isStackedAxisChartType(chartType?: AxisChartType, line?: LineChartOptions, isBarGrouped = true) {
  return chartType === 'bar'
    ? isBarGrouped
    : chartType === 'line' && !!line && (line.isGradient || !line.isSmooth)
}

export function resolveEChartsSeriesType(chartType?: AxisChartType): 'bar' | 'line' {
  return chartType === 'bar' ? 'bar' : 'line'
}

export function resolveEffectiveChartType(options: {
  activeCategoryCount: number
  configuredType: ChartType
  hasExpense: boolean
  hasIncome: boolean
  hasQuickCategoryFilter: boolean
}): ChartType {
  const hasSingleCashflowType = options.hasExpense !== options.hasIncome
  const shouldReplacePie = options.activeCategoryCount === 1
    || (options.hasQuickCategoryFilter && hasSingleCashflowType)
  return options.configuredType === 'pie' && shouldReplacePie
    ? 'bar'
    : options.configuredType
}

export function shouldUseQuickCategoryCashflowSeries(options: {
  chartType: ChartType
  filteredType: 'expense' | 'income' | 'net'
  hasBothCashflowTypes: boolean
  reportType: 'combined' | 'expense' | 'income'
  type?: 'expense' | 'income' | 'net'
}): boolean {
  return options.reportType === 'combined'
    && !options.type
    && options.filteredType === 'net'
    && options.hasBothCashflowTypes
    && (options.chartType === 'bar' || options.chartType === 'pie')
}
