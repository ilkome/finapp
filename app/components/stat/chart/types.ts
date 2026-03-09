export const chartTypes = ['bar', 'line'] as const

export type ChartType = (typeof chartTypes)[number]
