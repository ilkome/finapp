export default {
  chart: {
    backgroundColor: {
      stops: [
          // [0, '#2a2a2b'],
          // [1, '#3e3e40']
      ]
    },
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
  },
  // legend: {
  //   itemStyle: {
  //     color: '#E0E0E3'
  //   },
  //   itemHoverStyle: {
  //     color: '#FFF'
  //   },
  //   itemHiddenStyle: {
  //     color: '#606063'
  //   }
  // },
  // credits: {
  //   style: {
  //     color: '#666'
  //   }
  // },
  // labels: {
  //   style: {
  //     color: '#707073'
  //   }
  // },
  //
  // drilldown: {
  //   activeAxisLabelStyle: {
  //     color: '#F0F0F3'
  //   },
  //   activeDataLabelStyle: {
  //     color: '#F0F0F3'
  //   }
  // },

  // navigation: {
  //   buttonOptions: {
  //     symbolStroke: '#DDDDDD',
  //     theme: {
  //       fill: '#505053'
  //     }
  //   }
  // },

  // scroll charts
  // rangeSelector: {
  //   buttonTheme: {
  //     fill: '#505053',
  //     stroke: '#000000',
  //     style: {
  //       color: '#CCC'
  //     },
  //     states: {
  //       hover: {
  //         fill: '#707073',
  //         stroke: '#000000',
  //         style: {
  //           color: 'white'
  //         }
  //       },
  //       select: {
  //         fill: '#000003',
  //         stroke: '#000000',
  //         style: {
  //           color: 'white'
  //         }
  //       }
  //     }
  //   },
  //   inputBoxBorderColor: '#505053',
  //   inputStyle: {
  //     backgroundColor: '#333',
  //     color: 'silver'
  //   },
  //   labelStyle: {
  //     color: 'silver'
  //   }
  // },

  // navigator: {
  //   handles: {
  //     backgroundColor: '#666',
  //     borderColor: '#AAA'
  //   },
  //   outlineColor: '#CCC',
  //   maskFill: 'rgba(255,255,255,0.1)',
  //   series: {
  //     color: '#7798BF',
  //     lineColor: '#A6C7ED'
  //   },
  //   xAxis: {
  //     gridLineColor: '#505053'
  //   }
  // },

  // scrollbar: {
  //   barBackgroundColor: '#808083',
  //   barBorderColor: '#808083',
  //   buttonArrowColor: '#CCC',
  //   buttonBackgroundColor: '#606063',
  //   buttonBorderColor: '#606063',
  //   rifleColor: '#FFF',
  //   trackBackgroundColor: '#404043',
  //   trackBorderColor: '#404043'
  // },

  // special colors for some of the
  // legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  // background2: '#505053',
  // dataLabelsColor: '#B0B0B3',
  // textColor: '#C0C0C0',
  // contrastTextColor: '#F0F0F3',
  // maskColor: 'rgba(255,255,255,0.3)'
}
