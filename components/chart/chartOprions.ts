export const marklineActiveConfig = {
  symbol: [false, false],
  symbolSize: 10,
  itemStyle: {
    borderCap: 'round',
    color: 'var(--color-item-main-active)',
  },
  lineStyle: {
    width: 5,
    type: 'solid',
    opacity: 1,
  },
  label: {
    show: false,
  },
}

export const baseSeriesConfig = {
  z: 10,
  smooth: true,
  barMaxWidth: 16,
  symbol: 'circle',
  symbolSize: 6,
  lineStyle: {
    width: 2,
  },
  label: {
    show: true,
    backgroundColor: 'var(--c-item-bg-main)',
    borderRadius: 2,
    color: 'var(--color-item-base-down)',
    fontFamily: 'var(--font-secondary)',
    fontSize: '10',
    padding: [2, 0],
    position: 'top',
  },
}

export const baseSeriesItemStyle = {
  borderRadius: [4, 4, 0, 0],
}

export const averageLine = {
  z: 1,
  silent: true,
  symbol: [false, false],
  data: [{
    type: 'average',
    name: 'Avg',
    label: {
      show: false,
    },
  }],
  lineStyle: {
    type: 'solid',
    opacity: 0.7,
  },
}

// Options
export const options = {
  // Grid
  grid: {
    top: '30',
    left: '10',
    right: '10',
    bottom: '30',
    containLabel: true,
  },

  // Categories
  xAxis: {
    type: 'category',
    axisTick: {
      alignWithLabel: true,
    },
    axisLabel: {
      color: 'var(--color-item-base-down)',
      fontFamily: 'var(--font-secondary)',
      fontSize: '10',
    },
  },

  yAxis: {
    type: 'value',
    axisPointer: {
      snap: true,
    },
    position: 'right',
    axisTick: {
      lineStyle: {
        color: 'blue',
      },
    },
    splitLine: {
      lineStyle: {
        color: 'var(--c-bg-5)',
      },
    },
    axisLabel: {
      color: 'var(--color-item-base-down)',
      fontFamily: 'var(--font-secondary)',
      fontSize: '10',
    },
  },

  // Tooltip
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      // type: 'shadow',
      label: {
        backgroundColor: 'var(--color-item-main-active)',
      },
    },
    // valueFormatter: value => `${formatAmount(value)} ${getCurrencySymbol(baseCurrency.value)}`,

    // position(pos, params, dom, rect, size) {
    //   // tooltip will be fixed on the right if mouse hovering on the left,
    //   // and on the left if hovering on the right.
    //   const obj = { top: -60 }
    //   obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 0
    //   return obj
    // },
    backgroundColor: 'var(--c-item-bg-main)',
    borderColor: 'var(--c-item-bg-active)',
    textStyle: {
      color: 'var(--color-item-base)',
    },
  },
}
