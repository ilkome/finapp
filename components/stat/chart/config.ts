import dayjs from 'dayjs'
import { getCompactAmount, getLocalAmount } from '~/components/stat/chart/utils'

export const config = {
  // Grid
  grid: {
    top: '16',
    left: '12',
    right: '12',
    bottom: '12',
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
      color: 'var(--chart-label)',
    },
    formatter(props: any[]) {
      return `
        <div class="grid gap-2">
          <div>${props[0] && getLocalAmount(props[0].value)}</div>
          <div>${props[1] && getLocalAmount(props[1].value)}</div>
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
        formatter: props => getLocalAmount(props?.value),
      },
    },
    position: 'left',
    // position: 'right',
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
    },
    axisTick: {
      interval: 0,
    },
    axisPointer: {
      label: {},
      //     return dayjs(props.value).format()
      //   },
      // },
    },
  },
}

export const lineConfig = {
  type: 'line',
  barMinWidth: '4',
  barMaxWidth: '12',
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
