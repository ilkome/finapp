export default {
  chart: {
    backgroundColor: 'transparent',
    // height: '40%',
    spacing: [5, 0, 0, 0],
    type: 'column',
    zoomType: 'x',
    panning: true,
    panKey: 'shift'
  },
  credits: { enabled: false },
  legend: {
    itemHiddenStyle: {
      color: 'var(--c-font-5)'
    },
    itemStyle: {
      color: 'var(--c-font-2)'
    },
    itemHoverStyle: {
      color: 'var(--c-font-3)'
    }
  },
  plotOptions: {
    areaspline: {
      fillOpacity: 0.3,
      borderWidth: 2,
      marker: {
        enabled: false,
        symbol: 'circle',
        radius: 3,
        states: {
          hover: {
            enabled: true
          }
        }
      }
    },
    column: {
      groupPadding: 0.2,
      pointPadding: 0.2,
      borderWidth: 0
    },
    spline: {
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 2
        }
      },
      marker: {
        enabled: false
      }
    }
  },
  series: [],
  title: { text: null },
  tooltip: {
    animation: true,
    backgroundColor: 'var(--c-bg-3)',
    borderColor: 'var(--c-bg-7)',
    borderRadius: 3,
    padding: 10,
    shadow: false,
    style: {
      color: 'var(--c-font-2)',
      fontSize: '12px'
    },
    shared: true
  },
  xAxis: {
    categories: [],
    crosshair: true,
    lineColor: 'var(--c-bg-7)',
    tickColor: 'var(--c-bg-7)',
    tickmarkPlacement: 'on',
    labels: {
      style: {
        color: 'var(--c-font-4)',
        fontSize: '12px',
        fontFamily: 'var(--font-secondary)',
        textTransform: 'uppercase'
      }
    }
  },
  yAxis: {
    alternateGridColor: '',
    gridLineColor: 'var(--c-bg-4)',
    title: { text: null }
  }
}
