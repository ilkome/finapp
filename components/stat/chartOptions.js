export default {
  chart: {
    backgroundColor: 'transparent',
    with: '100%',
    height: '40%',
    spacing: [5, 0, 0, 0],
    type: 'column',
    zoomType: 'x',
    panning: true,
    panKey: 'shift',
    events: {
      click (e) {
        // console.log(this.series[0].searchPoint(e, true))
      }
    }
  },
  credits: { enabled: false },
  legend: {
    itemHiddenStyle: {
      fontWeight: 'normal',
      color: 'var(--c-font-5)'
    },
    itemStyle: {
      fontWeight: 'normal',
      color: 'var(--c-font-4)'
    },
    itemHoverStyle: {
      fontWeight: 'normal',
      color: 'var(--c-font-4)'
    }
  },
  plotOptions: {
    // series: {
    //   allowPointSelect: true,
    //   marker: {
    //     states: {
    //       select: {
    //         enabled: true
    //       }
    //     }
    //   }
    // },
    areaspline: {
      fillOpacity: 0.3,
      borderWidth: 2
    },
    column: {
      groupPadding: 0.2,
      pointPadding: 0.1,
      borderWidth: 0,
      column: {
        borderRadiusTopLeft: 5,
        borderRadiusTopRight: 5
      }
    },
    spline: {
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 2
        }
      },
      marker: {
        // enabled: false
      }
    }
  },
  series: [],
  title: { text: null },
  tooltip: {
    shared: true,
    animation: true,
    backgroundColor: 'var(--c-bg-3)',
    borderColor: 'var(--c-bg-7)',
    borderRadius: 8,
    padding: 12,
    shadow: false,
    style: {
      color: 'var(--c-font-2)',
      fontSize: '10px'
    },
    positioner (labelWidth, labelHeight, point) {
      const leftHalf = point.plotX < (this.chart.plotWidth / 2)
      const topHalf = point.plotY < (this.chart.plotHeight / 2)
      return {
        x: leftHalf ? this.chart.plotLeft + this.chart.plotWidth - labelWidth - 2 : this.chart.plotLeft,
        y: topHalf ? this.chart.plotTop + this.chart.plotHeight - labelHeight : this.chart.plotTop
      }
    }
  },
  xAxis: {
    categories: [],
    lineColor: 'var(--c-bg-7)',
    tickColor: 'var(--c-bg-7)',
    tickmarkPlacement: 'on',
    labels: {
      style: {
        cursor: 'pointer',
        color: 'var(--c-font-5)',
        fontSize: '10px',
        fontFamily: 'var(--font-secondary)',
        textTransform: 'uppercase'
      }
    },
    crosshair: true
      // color: 'green'
    // }
    // plotBands: [{
    //   color: 'orange', // Color value
    //   from: 3.5, // Start of the plot band
    //   to: 4.5 // End of the plot band
    // }]
  },
  yAxis: {
    cursor: 'pointer',
    alternateGridColor: '',
    gridLineColor: 'var(--c-bg-5)',
    title: { text: null },
    labels: {
      style: {
        cursor: 'pointer',
        color: 'var(--c-font-5)',
        fontSize: '12px',
        fontFamily: 'var(--font-secondary)',
        textTransform: 'uppercase'
      }
    },
    // opposite: true,
    // labels: {
    //   align: 'left'
    // }
  }
}
