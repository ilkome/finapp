import type { chartValueDisplayOptions } from '~/components/stat/config/schema'
import type { ChartSeries } from '~/components/stat/types'

export type ChartValueDisplay = typeof chartValueDisplayOptions[number]

export function applyChartValueDisplay(series: ChartSeries[], mode: ChartValueDisplay): ChartSeries[] {
  return series.map((item) => {
    const seriesValueType = item.markLineValueType ?? item.valueTypes?.find(Boolean)
    const direction = mode === 'signed' && seriesValueType === 'expense' ? -1 : 1
    const markLineData = Array.isArray(item.markLine?.data)
      ? item.markLine.data.map((entry: { yAxis?: number }) => ({
          ...entry,
          yAxis: typeof entry.yAxis === 'number' ? direction * Math.abs(entry.yAxis) : entry.yAxis,
        }))
      : undefined

    return {
      ...item,
      data: item.data.map((value, index) =>
        mode === 'signed' && item.valueTypes?.[index] === 'expense'
          ? -Math.abs(value)
          : Math.abs(value),
      ),
      markLine: markLineData ? { ...item.markLine, data: markLineData } : item.markLine,
    }
  })
}
