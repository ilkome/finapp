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
      type: 'pie'
    },
    plotOptions: {
      pie: {
        allowPointSelect: false,
        dataLabels: {
          enabled: false
        },
        enableMouseTracking: false
      }
    },
    title: {
      text: '',
    },
    series: [{
      data: [{
        y: options.incomes,
        color: '#1e7a45'
      }, {
        y: options.expenses,
        color: '#a73b2f'
      }]
    }],
    credits: {
      enabled: false
    }
  })
}

export default {
  props: {
    incomes: {
      type: Number,
      required: true
    },
    expenses: {
      type: Number,
      required: true
    }
  },

  watch: {
    incomes() {
      renderChart(this)
    },
    expenses() {
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
    width 160px
    height 160px
</style>
