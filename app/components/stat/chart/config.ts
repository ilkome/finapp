import type { GridComponentOption } from 'echarts'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
import type { TooltipComponentOption } from 'echarts/components'
import type { ComposeOption } from 'echarts/core'

import type { SeriesSlug } from '~/components/stat/types'

import { getCompactAmount, getLocalAmount } from '~/components/stat/chart/utils'

type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | PieSeriesOption
  | GridComponentOption
>

type SeriesOption = (BarSeriesOption | LineSeriesOption) & {
  localeKey: string
  markLineColor?: string
}

export const seriesOptions: Record<SeriesSlug, SeriesOption> = {
  expense: {
    color: 'var(--expense-1)',
    localeKey: 'money.expense',
    markLineColor: 'var(--expense-2)',
    type: 'bar',
  },
  income: {
    color: 'var(--income-1)',
    localeKey: 'money.expense',
    markLineColor: 'var(--income-2)',
    type: 'bar',
  },
}

export const config: EChartsOption['baseOption'] = {
  // Grid
  grid: {
    bottom: '0',
    containLabel: true,
    left: '5',
    right: '5',
    top: '5',
  },

  // Tooltip
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

  // xAxis
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

  // yAxis
  yAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      formatter: (n: number) => getCompactAmount(n),
      show: false, // TODO: config
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
        formatter: props => getLocalAmount(+props.value) ?? '',
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

export const lineConfig = {
  areaStyle: {
    opacity: 0.1,
  },
  barMaxWidth: '12',
  barMinWidth: '1',
  borderColor: 'blue',
  cursor: 'default',
  emphasis: {
    disabled: true,
  },
  label: {
    formatter: ({ value }: { value: number }) => getCompactAmount(value),
    position: 'top',
    show: true,
  },
  lineStyle: {
    width: 2,
  },
  smooth: true,
  symbol: 'circle',
  symbolSize: 7,
  type: 'line',
}
