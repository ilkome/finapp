import { getCompactAmount, getLocalAmount } from '~/components/stat/chart/utils'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

export const seriesOptions: Record<MoneyTypeSlugNew, { color: string, localeKey: string, type: string }> = {
  expense: {
    color: '#ED6660',
    localeKey: 'money.expense',
    type: 'bar',
  },
  income: {
    // color: '#22A2D3',
    color: 'var(--text-income-1)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  sum: {
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

    backgroundColor: 'var(--chart-bg)',
    borderWidth: 0,
    // formatter: '{b0}: {c0}<br />{b1}: {c1}',
    label: {
      backgroundColor: 'var(--chart-bg)',
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
        // color: 'transparent',
      },
    },

    axisPointer: {
      label: {},
    },
    axisTick: {
      interval: 0,
      lineStyle: {
        // color: 'transparent',
      },
    },
    // boundaryGap: false,
    type: 'category',
  },

  // yAxis
  yAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      formatter: n => getCompactAmount(n),
      // show: false,
    },
    axisPointer: {
      label: {
        formatter: props => getLocalAmount(props?.value),
      },
      snap: true,
    },
    minInterval: 1,

    // position: 'left',
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
