export default {
  chart: {
    backgroundColor: 'transparent',
    with: '100%',
    height: '40%',
    spacing: [5, 0, 0, 0],
    type: 'column',
    panning: true,
    panKey: 'shift'
  },

  title: { text: null },
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
    areaspline: {
      fillOpacity: 0.3,
      borderWidth: 2
    },

    column: {
      groupPadding: 0.2,
      pointPadding: 0.1,
      borderWidth: 0,
      maxPointWidth: 10
    },

    spline: {
      lineWidth: 2,
      states: {
        hover: {
          lineWidth: 2
        }
      }
    },

    pie: {
      dataLabels: {
        enabled: false,
        distance: -30,
        format: '<b>{point.name}</b><br>{point.y}',
        filter: {
          property: 'percentage',
          operator: '>',
          value: 4
        }
      },
      startAngle: 270
    },

    series: {
      states: {
        inactive: {
          opacity: 1
        }
      },

      marker: {
        radius: 2,
        fillColor: 'var(--c-bg-4)',
        lineWidth: 2,
        lineColor: 'var(--c-incomes-1)',
        symbol: 'circle'
      },

      dataLabels: {
        enabled: true,
        allowOverlap: false,
        shadow: false,
        color: 'var(--c-font-3)',
        backgroundColor: 'var(--c-bg-15)',
        align: 'center',
        borderRadius: 3,
        padding: 3,
        y: -8,
        style: {
          textOutline: 'var(--c-bg-1)',
          color: 'var(--c-bg-7)',
          fontSize: '10px',
          fontFamily: 'var(--font-secondary)',
          fontWeight: 400,
          textTransform: 'uppercase'
        }
      }
    }
  },

  xAxis: {
    categories: [],
    lineColor: 'var(--c-bg-7)',
    tickColor: 'var(--c-bg-7)',
    tickmarkPlacement: 'on',
    labels: {
      padding: 15,
      rotation: false,
      style: {
        cursor: 'pointer',
        color: 'var(--c-font-5)',
        fontSize: '10px',
        fontFamily: 'var(--font-secondary)',
        textTransform: 'uppercase'
      }
    },

    crosshair: {
      enabled: true
    }
  },

  yAxis: {
    endOnTick: false,
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
    }
  },

  tooltip: {
    shared: true,
    animation: false,
    backgroundColor: 'var(--c-bg-3)',
    borderColor: 'var(--c-bg-7)',
    borderRadius: 8,
    padding: 12,
    shadow: false,
    style: {
      color: 'var(--c-font-2)',
      fontSize: '12px',
      fontFamily: 'var(--font-roboto)'
    }
  }
}
