import type { GridComponentOption } from 'echarts'
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts'
import type { TooltipComponentOption } from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

import type { SeriesSlug } from '~/components/stat/types'

import { formatChartAmount, formatCompactChartAmount } from '~/components/stat/chart/utils'

type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
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

export const config: EChartsOption['baseOption'] = {
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

export const defaultSeriesConfig = {
  areaStyle: {
    opacity: 0.1,
  },
  barMaxWidth: '12',
  // ponytail: floor bar height so a large outlier (e.g. a salary day) doesn't
  // flatten every other day to an invisible stub; small days stay visible,
  // large ones stay honest. Ceiling: floored slivers aren't comparable to each
  // other. Log scale is out - daily data has zero days and log(0) breaks it.
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
