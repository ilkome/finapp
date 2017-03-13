<template lang="pug">
  .chart loading...
</template>

<script>
import Highcharts from 'highcharts'
import chartTheme from './chartTheme'

const renderChart = (options) => {
  Highcharts.setOptions(chartTheme)
  Highcharts.chart(options.$el, {
    chart: {
      type: options.data.type,
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: false
      }
    },
    legend: {
      enabled: false
    },
    title: {
      text: options.data.title
    },
    xAxis: {
      categories: options.data.categories,
      crosshair: true,
      labels: {
        x: 0
      }
    },
    yAxis: {
      title: {
        enabled: false
      },
    },
    series: options.data.series,
    tooltip: {
      shared: true
    },
    credits: {
      enabled: false
    }
  })
}

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },

  watch: {
    data() {
      renderChart(this)
    }
  },

  mounted() {
    renderChart(this)
  }
}
</script>


<style lang="stylus" scoped>
  .chart
    height 300px

    @media $laptop
      height 800px
</style>
