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
      animation: false,
      type: 'cross',
    },

    backgroundColor: 'var(--chart-bg)',
    borderWidth: 0,
    label: {
      backgroundColor: 'var(--chart-bg)',
      color: 'red',
    },
    // },
    padding: 8,
    // formatter(props: any[]) {
    //   return `
    //     <div class="grid gap-2 px-2 text-secondary">
    //       ${props.filter(i => i.value !== 0).map((i, idx) => `
    //         ${idx === 0 ? `<div class="text-prima">${i.axisValueLabel}</div>` : ''}

    //         <div class="flex gap-2">
    //           <div>${i.marker}</div>
    //           <div class="text-right">${getLocalAmount(i.value)}</div>
    //         </div>
    //       `)}
    //       </div>
    //       `
    textStyle: {
      color: 'var(--chart-tooltip)',
    },
    // position() {
    //   return {
    //     right: '10',
    //     top: '0',
    //   }
    // show: false,
    // },
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
