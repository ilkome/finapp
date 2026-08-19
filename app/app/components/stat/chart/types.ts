export const chartTypes = ['bar', 'line', 'pie'] as const

export type ChartType = (typeof chartTypes)[number]
export type AxisChartType = Exclude<ChartType, 'pie'>
