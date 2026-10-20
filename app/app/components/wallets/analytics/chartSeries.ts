import type { CurrencyCode } from '~/components/currencies/types'
import type { ChartSeries } from '~/components/stat/types'

import { minorToAmount } from '~/components/amount/utils'
import { defaultConfig } from '~/components/stat/config/schema'

/** Charts read decimals; analytics keeps minor units until here. */
export function toChartSeries(series: ChartSeries[], currencyCode: CurrencyCode): ChartSeries[] {
  return series.map(item => ({ ...item, data: item.data.map(value => minorToAmount(value, currencyCode)) }))
}

/** Line chart for discrete points: markers on, no smoothing, value scale shown. */
export const pointLineChartConfig = { ...defaultConfig.chart, isShowScale: true, line: { ...defaultConfig.chart.line, isShowPoints: true, isSmooth: false }, type: 'line' as const }

/** Points of a sparkline in a `width` x `height` box, y down, `pad` kept free at top and bottom; empty under two values. */
export function sparklinePoints(values: number[], width: number, height: number, pad = 0): [number, number][] {
  if (values.length < 2)
    return []
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  return values.map((value, index) => [index / (values.length - 1) * width, height - pad - (value - min) / span * (height - pad * 2)])
}
