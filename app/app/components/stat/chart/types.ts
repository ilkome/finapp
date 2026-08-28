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
