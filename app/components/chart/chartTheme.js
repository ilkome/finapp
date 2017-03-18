export default {
  chart: {
    backgroundColor: {},
    style: {
      fontFamily: '\'Unica One\', sans-serif'
    },
    plotBorderColor: 'blue'
  },
  title: {
    style: {
      color: '#E0E0E3',
      textTransform: 'uppercase',
      fontSize: '20px'
    }
  },
  subtitle: {
    style: {
      color: '#E0E0E3',
      textTransform: 'uppercase'
    }
  },
  xAxis: {
    gridLineColor: 'red',
    labels: {
      style: {
        color: '#ababab'
      }
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#242424',
    title: {
      style: {
        color: '#A0A0A3'

      }
    }
  },
  yAxis: {
    gridLineColor: '#242424',
    labels: {
      style: {
        color: '#ababab'
      }
    },
    lineColor: '#707073',
    minorGridLineColor: '#505053',
    tickColor: '#242424',
    tickWidth: 1,
    title: {
      style: {
        color: '#A0A0A3'
      }
    }
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    style: {
      color: '#F0F0F0'
    }
  },
  plotOptions: {
    series: {
      dataLabels: {
        color: '#B0B0B3' // price
      },
      marker: {
        lineColor: 'red'
      }
    },
    boxplot: {
      fillColor: 'red'
    },
    candlestick: {
      lineColor: 'red'
    },
    errorbar: {
      color: 'red'
    }
  }
}
