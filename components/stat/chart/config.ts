import { getCompactAmount, getLocalAmount } from '~/components/stat/chart/utils'

export const config = {
  // Grid
  grid: {
    bottom: '12',
    containLabel: true,
    left: '12',
    right: '12',
    top: '14',
  },

  // Tooltip
  tooltip: {
    axisPointer: {
      // type: 'cross',
      animation: false,
    },

    backgroundColor: 'var(--chart-bg)',
    borderWidth: 0,
    formatter(props: any[]) {
      return `
        <div class="grid gap-2 px-2 text-secondary">
          ${props.map((i, idx) => `
            ${idx === 0 ? `<div class="text-prima">${i.axisValueLabel}</div>` : ''}

            <div class="flex gap-2">
              <div>${i.marker}</div>
              <div class="text-right">${getLocalAmount(i.value)}</div>
            </div>
          `)}
          </div>
          `
    },
    padding: 8,
    position() {
      return {
        bottom: '100%',
        right: '10',
      }
    },
    textStyle: {
      color: '',
    },
    // show: false,
    trigger: 'axis',

    valueFormatter: getLocalAmount,
  },

  // xAxis
  xAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
    },
    axisPointer: {
      label: {},
      //     return dayjs(props.value).format()
      //   },
      // },
    },
    axisTick: {
      interval: 0,
    },
    splitLine: {
      lineStyle: {
        color: 'var(--chart-line)',
      },
      show: false,
    },
    type: 'category',
  },

  // yAxis
  yAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      formatter: n => getCompactAmount(n),
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
      },
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
        // color: 'transparent',
      },
    },
    type: 'value',
  },
}

export const lineConfig = {
  barMaxWidth: '12',
  barMinWidth: '8',
  borderColor: 'blue',
  cursor: 'default',
  emphasis: {
    disabled: true,
  },
  label: {
    formatter: ({ value }) => getCompactAmount(value),
    position: 'top',
    show: true,
  },
  lineStyle: {
    width: 3,
  },
  smooth: true,
  symbol: 'circle',
  symbolSize: 7,
  type: 'line',
}
