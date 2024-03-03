import { getCompactAmount, getLocalAmount } from '~/components/chart/utils'

export const config = {
  // Grid
  grid: {
    top: '20',
    left: '15',
    right: '10',
    bottom: '10',
    containLabel: true,
  },

  // Tooltip
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      animation: false,
    },
    backgroundColor: 'var(--chart-bg)',
    borderWidth: 0,
    padding: 8,
    textStyle: {
      color: 'var(--chart-label2)',
    },
    formatter(props) {
      return `
        <div class="grid gap-2">
          <div>${getLocalAmount(props[0].value)}</div>
          <div>${getLocalAmount(props[1].value)}</div>
        </div>
      `
    },
  },

  // yAxis
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: 'var(--chart-line)',
      },
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
    },
    minInterval: 1,
    axisPointer: {
      snap: true,
      label: {
        formatter: props => getLocalAmount(props.value),
      },
    },
    position: 'right',
    axisLabel: {
      color: 'var(--chart-label)',
      formatter: n => getCompactAmount(n),
    },
  },

  // xAxis
  xAxis: {
    type: 'category',
    splitLine: {
      show: true,
      lineStyle: {
        color: 'var(--chart-line)',
      },
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
    },
    axisLabel: {
      color: 'var(--chart-label)',
      // formatter(date) {
      //   return dayjs(date).format()
      // },
    },
    axisTick: {
      interval: 0,
    },
    axisPointer: {
      // label: {
      //   formatter(props) {
      //     return dayjs(props.value).format()
      //   },
      // },
    },
  },
}

export const lineConfig = {
  type: 'line',
  barMinWidth: '10',
  barMaxWidth: '30',
  smooth: true,
  emphasis: {
    disabled: true,
  },
  label: {
    position: 'top',
    show: true,
    formatter: ({ value }) => getCompactAmount(value),
  },
  symbolSize: 7,
  borderColor: 'blue',
  symbol: 'circle',
  cursor: 'default',
  lineStyle: {
    width: 2,
  },
}
