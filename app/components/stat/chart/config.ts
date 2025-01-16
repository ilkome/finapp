import type { ChartType } from '~/components/stat/chart/types'
import type { StatTabSlug } from '~/components/stat/types'

import { getCompactAmount, getLocalAmount } from '~/components/stat/chart/utils'

export const seriesOptions: Record<StatTabSlug, { color: string, colorLine?: string, localeKey: string, type: ChartType }> = {
  expense: {
    color: 'var(--expense-1)',
    colorLine: 'var(--expense-2)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  income: {
    color: 'var(--income-1)',
    colorLine: 'var(--income-2)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  netIncome: {
    color: 'grey',
    localeKey: 'money.netIncome',
    type: 'line',
  },
  summary: {
    color: 'grey',
    localeKey: 'money.netIncome',
    type: 'line',
  },
} as const

export const config = {
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

    backgroundColor: 'var(--chart-line)',
    borderWidth: 0,
    label: {
      backgroundColor: 'var(--chart-line)',
      color: 'red',
    },
    padding: 8,
    textStyle: {
      color: 'var(--chart-tooltip)',
    },
    trigger: 'axis',
    valueFormatter: getLocalAmount,
  },

  // xAxis
  xAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      fontSize: 8,
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
    },

    axisPointer: {
      label: {
        color: 'var(--chart-axisLabel)',
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
      formatter: n => getCompactAmount(n),
      // show: false,
    },

    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
    },
    axisPointer: {
      label: {
        color: 'var(--chart-axisLabel)',
        formatter: props => getLocalAmount(props?.value),
      },
      snap: true,
    },
    minInterval: 1,

    position: 'right',
    splitLine: {
      lineStyle: {
        color: 'var(--chart-line)',
      },
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
