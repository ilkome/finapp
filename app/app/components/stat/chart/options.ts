import type { GridComponentOption, InsideDataZoomComponentOption } from 'echarts'
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'
import type { TooltipComponentOption } from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

import defu from 'defu'

import type { AxisChartType, LineChartOptions } from '~/components/stat/chart/types'
import type { ChartSeries, SeriesSlug } from '~/components/stat/types'

import { formatChartAmount, formatCompactChartAmount } from '~/components/stat/chart/format'
import { defaultLineChartOptions, isStackedAxisChartType, resolveEChartsSeriesType } from '~/components/stat/chart/types'

type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
  | InsideDataZoomComponentOption
>

type SeriesOption = (BarSeriesOption | LineSeriesOption) & {
  markLineColor?: string
}

export const seriesOptions: Record<SeriesSlug, SeriesOption> = {
  expense: {
    color: 'var(--color-expense-1)',
    markLineColor: 'var(--color-expense-2)',
    type: 'bar',
  },
  income: {
    color: 'var(--color-income-1)',
    markLineColor: 'var(--color-income-2)',
    type: 'bar',
  },
}

export const baseOption: EChartsOption['baseOption'] = {
  animation: false,

  grid: {
    bottom: '0',
    containLabel: true,
    left: '5',
    right: '5',
    top: '5',
  },

  tooltip: {
    axisPointer: {
      animation: false,
      type: 'cross',
    },
    backgroundColor: 'transparent',
    borderWidth: 0,
    confine: true,
    padding: 0,
    trigger: 'axis',
  },

  xAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      fontSize: 8,
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-line)',
      },
    },
    axisPointer: {
      label: {
        backgroundColor: 'var(--chart-line)',
        color: 'var(--chart-axisLabel)',
        margin: 10,
      },
    },
    axisTick: {
      interval: 0,
    },
    type: 'category',
  },

  yAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      formatter: (n: number) => formatCompactChartAmount(n),
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
    },
    axisPointer: {
      label: {
        backgroundColor: 'var(--chart-line)',
        color: 'var(--chart-axisLabel)',
        formatter: props => formatChartAmount(+props.value) ?? '',
      },
      snap: true,
    },
    minInterval: 1,

    position: 'right',
    splitLine: {
      lineStyle: {
        color: 'var(--chart-line)',
      },
      show: false,
    },
    type: 'value',
  },
}

export function filterChartTooltipParams<T extends { value: unknown }>(params: T[]): Array<T & { value: number }> {
  return params.filter((param): param is T & { value: number } => typeof param.value === 'number' && Number.isFinite(param.value) && param.value !== 0)
}

export function sortChartTooltipParams<T>(
  params: T[],
  resolveValue: (param: T) => number,
  isPinnedLast: (param: T) => boolean = () => false,
): T[] {
  return params
    .map((param, index) => ({ index, isPinnedLast: isPinnedLast(param), param, value: resolveValue(param) }))
    .sort((a, b) => {
      const pinnedOrder = Number(a.isPinnedLast) - Number(b.isPinnedLast)
      if (pinnedOrder !== 0)
        return pinnedOrder
      const signOrder = Number(a.value < 0) - Number(b.value < 0)
      if (signOrder !== 0)
        return signOrder
      return Math.abs(b.value) - Math.abs(a.value) || a.index - b.index
    })
    .map(item => item.param)
}

export function resolveChartTooltipPosition(
  point: [number, number],
  viewSize: [number, number],
): [number, number] {
  return [point[0] > viewSize[0] / 2 ? 0 : viewSize[0] / 2, 0]
}

export function resolveChartScale(series: ChartSeries[], chartType?: AxisChartType, line = defaultLineChartOptions) {
  const values = isStackedAxisChartType(chartType, line)
    ? Array.from({ length: Math.max(0, ...series.map(item => item.data.length)) }, (_, index) => {
        const pointValues = series.map(item => item.data[index] ?? 0).filter(Number.isFinite)
        return [
          pointValues.filter(value => value > 0).reduce((total, value) => total + value, 0),
          pointValues.filter(value => value < 0).reduce((total, value) => total + value, 0),
        ]
      }).flat()
    : series.flatMap(item => item.data).filter(Number.isFinite)
  const max = Math.max(0, ...values.map(Math.abs))

  if (max === 0)
    return { interval: 0.5, max: 1, min: 0 }

  return values.some(value => value < 0)
    ? { interval: max, max, min: -max }
    : { interval: max / 2, max, min: 0 }
}

export function resolveChartAverage(series: ChartSeries[]) {
  return resolveChartSeriesAverages(series).find(value => value !== undefined)
}

export function resolveChartSeriesAverages(series: ChartSeries[]) {
  return series.map((source) => {
    if (!source.averageMode || source.data.length === 0)
      return undefined

    if (source.averageMode === 'series')
      return source.data.reduce((total, value) => total + value, 0) / source.data.length

    const stackSeries = series.filter(item => !item.markedArea && item.icon)
    const totals = Array.from({ length: source.data.length }, (_, index) => stackSeries.reduce((total, item) => total + (item.data[index] ?? 0), 0))
    return totals.reduce((total, value) => total + value, 0) / source.data.length
  })
}

export function resolveChartScaleWidth(scale: { max: number, min: number }, averages?: number | number[]) {
  const averageValues = averages === undefined ? [] : Array.isArray(averages) ? averages : [averages]
  const labels = [scale.min, (scale.min + scale.max) / 2, ...averageValues, scale.max].map(formatCompactChartAmount)
  return Math.max(18, Math.max(...labels.map(label => label.length)) * 5 + 12)
}

export function resolveChartGuideValues(scale: { max: number, min: number }, average?: number) {
  const middle = (scale.min + scale.max) / 2
  if (average === undefined)
    return [scale.min, middle, scale.max]

  const isFarFromMiddle = Math.abs(average - middle) > (scale.max - scale.min) * 0.1
  return [...new Set([
    scale.min,
    ...(isFarFromMiddle ? [middle] : []),
    average,
    scale.max,
  ])].sort((a, b) => a - b)
}

export function buildChartGuideMarkLine(scale: { max: number, min: number }, average?: number) {
  return {
    data: resolveChartGuideValues(scale, average).map(value => ({
      ...(value === average
        ? {
            label: { color: 'var(--ui-text-dimmed)', opacity: 1 },
            lineStyle: { color: 'var(--ui-text-dimmed)', opacity: 1 },
          }
        : {}),
      yAxis: value,
    })),
    label: {
      align: 'left',
      color: 'var(--chart-label)',
      distance: 6,
      fontFamily: 'var(--font-secondary)',
      formatter: ({ value }: { value: number }) => formatCompactChartAmount(value),
      position: 'end',
      show: true,
      textBorderColor: 'transparent',
      textBorderWidth: 0,
      textShadowBlur: 0,
    },
    lineStyle: {
      color: 'var(--ui-bg-elevated)',
      opacity: 0.5,
      type: 'solid',
    },
    silent: true,
    symbol: false,
    z: 0,
  }
}

export const defaultSeriesConfig = {
  areaStyle: {
    opacity: 0.1,
  },
  barMaxWidth: '12',
  // Floor bar height so a large outlier (e.g. a salary day) doesn't flatten
  // every other day to an invisible stub. Zero-value periods are nulled out
  // before this applies (see buildChartSeries below), so empty days show no bar.
  barMinHeight: 2,
  barMinWidth: '1',
  cursor: 'default',
  emphasis: {
    disabled: true,
  },
  label: {
    formatter: ({ value }: { value: number }) => formatCompactChartAmount(value),
    position: 'top',
    show: false,
  },
  lineStyle: {
    width: 2,
  },
  smooth: true,
  symbol: 'circle',
  symbolSize: 7,
  type: 'line',
}

export function buildChartSeries(series: ChartSeries[], chartType?: AxisChartType, line: LineChartOptions = defaultLineChartOptions) {
  return series
    .map((item: ChartSeries) => {
      const effectiveChartType = chartType || item.type
      const isBar = effectiveChartType === 'bar'
      const isLine = effectiveChartType === 'line'
      const seriesType = resolveEChartsSeriesType(effectiveChartType)
      const areaStyle = isLine && line.isGradient
        ? defaultSeriesConfig.areaStyle
        : { opacity: 0 }
      return {
        ...defu(defaultSeriesConfig, item),
        areaStyle,
        // Zero = no trns that period; render no bar (null), not a floored stub.
        // Lines keep 0 as a real point so they stay connected.
        data: isBar || isLine && line.isSkipZero ? item.data.map(v => (v === 0 ? null : v)) : item.data,
        emphasis: isLine && line.isGradient ? { focus: 'series' as const } : defaultSeriesConfig.emphasis,
        label: defaultSeriesConfig.label,
        lineStyle: defaultSeriesConfig.lineStyle,
        showSymbol: isLine && line.isShowPoints,
        smooth: isLine ? line.isSmooth : false,
        stack: isStackedAxisChartType(chartType, line) ? 'b' : false,
        type: item.markedArea ? 'bar' : seriesType,
      }
    })
}
