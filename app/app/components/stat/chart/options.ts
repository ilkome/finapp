import type { GridComponentOption, InsideDataZoomComponentOption } from 'echarts'
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'
import type { TooltipComponentOption } from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

import defu from 'defu'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { ChartSeries, SeriesSlug } from '~/components/stat/types'

import { formatChartAmount, formatCompactChartAmount } from '~/components/stat/chart/format'

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

export function resolveChartTooltipPosition(
  point: [number, number],
  viewSize: [number, number],
): [number, number] {
  return [point[0] > viewSize[0] / 2 ? 0 : viewSize[0] / 2, 0]
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

export function buildChartSeries(series: ChartSeries[], chartType?: AxisChartType) {
  return series
    .map((item: ChartSeries) => {
      const isBar = (chartType || item.type) === 'bar'
      return {
        ...defu(defaultSeriesConfig, item),
        // Zero = no trns that period; render no bar (null), not a floored stub.
        // Lines keep 0 as a real point so they stay connected.
        data: isBar ? item.data.map(v => (v === 0 ? null : v)) : item.data,
        label: defaultSeriesConfig.label,
        stack: isBar ? 'b' : false,
        type: item.markedArea ? 'bar' : (chartType || item.type),
      }
    })
}
