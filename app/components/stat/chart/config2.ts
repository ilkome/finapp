import { getCompactAmount, getLocalAmount } from '~/components/stat/chart/utils'

export const seriesOptions = {
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
  // grid: {
  //   bottom: '12',
  //   containLabel: true,
  //   left: '12',
  //   right: '12',
  //   top: '14',
  // },

  grid: {
    bottom: '0',
    containLabel: true,
    left: '5',
    right: '5',
    top: '0',
  },

  // Tooltip
  tooltip: {
    // axisPointer: {
    //   animation: false,
    //   type: 'cross',
    // },

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
    //         ${idx === 0 ? `<div class="text-1">${i.axisValueLabel}</div>` : ''}

    //         <div class="flex gap-2">
    //           <div>${i.marker}</div>
    //           <div class="text-right">${getLocalAmount(i.value)}</div>
    //         </div>
    //       `)}
    //       </div>
    //   }
    show: false,
    // position() {
    //   return {
    //     right: '10',
    //     top: '0',
    //       `
    textStyle: {
      color: 'var(--chart-tooltip)',
    },
    // },
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
        // color: 'var(--chart-splitLine)',
        color: 'transparent',
      },
    },
    axisPointer: {
      label: {},
    },
    // boundaryGap: false,
    // axisTick: {
    //   interval: 0,
    // },
    // splitLine: {
    //   lineStyle: {
    //     color: 'var(--chart-line)',
    //   },
    //   show: false,
    // },
    type: 'category',
  },
  // xAxis: {
  //   axisLabel: {
  //     color: 'var(--chart-label)',
  //   },
  //   axisLine: {
  //     lineStyle: {
  //       color: 'var(--chart-splitLine)',
  //     },
  //   },
  //   axisPointer: {
  //     label: {},
  //   },
  //   axisTick: {
  //     interval: 0,
  //   },
  //   splitLine: {
  //     lineStyle: {
  //       color: 'var(--chart-line)',
  //     },
  //     show: false,
  //   },
  //   type: 'category',
  // },

  // yAxis
  // yAxis: {
  //   axisLabel: {
  //     color: 'var(--chart-label)',
  //     formatter: n => getCompactAmount(n),
  //   },
  //   axisLine: {
  //     lineStyle: {
  //       color: 'var(--chart-splitLine)',
  //     },
  //   },
  //   axisPointer: {
  //     label: {
  //       formatter: props => getLocalAmount(props?.value),
  //     },
  //     snap: true,
  //   },
  //   minInterval: 1,
  //   // position: 'left',
  //   position: 'right',
  //   splitLine: {
  //     lineStyle: {
  //       color: 'var(--chart-line)',
  //     },
  //   },
  //   type: 'value',
  // },
  yAxis: {
    axisLabel: {
      color: 'var(--chart-label)',
      formatter: n => getCompactAmount(n),
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: 'var(--chart-splitLine)',
        show: false,
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
      lineStyle: false,
      // color: 'var(--chart-line)',
      // show: false,
    },
    type: 'value',
  },
}

export const lineConfig = {
  areaStyle: {
    opacity: 0.1,
  },
  barMaxWidth: '26',
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
