<template lang="pug">
  .chart(:class="className") loading...
</template>

<script>
import Highcharts from 'highcharts'
import chartTheme from './chartTheme'

export default {
  props: {
    chartType: {
      type: String,
      default: 'column'
    },
    chartTitle: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      required: true
    },
  },

  data() {
    return {
      chart: null
    }
  },

  computed: {
    className() {
      if (this.chartType === 'pie') return 'chart__pie'
      return 'chart__column'
    }
  },

  watch: {
    data() {
      if (this.chart) {
        this.chart.series[0].setData(this.data.series[0].data)
        this.chart.xAxis[0].setCategories(this.data.categories)
      }
    }
  },

  methods: {
    init() {
      if (!this.chart) {
        const router = this.$router

        Highcharts.setOptions(chartTheme)
        this.chart = new Highcharts.Chart(this.$el, {
          chart: {
            type: this.chartType
          },
          plotOptions: {
            area: {
              dataLabels: { enabled: true },
              // enableMouseTracking: true
            },
            column: {
              allowPointSelect: false,
              dataLabels: { enabled: true },
              // enableMouseTracking: false
            },
            pie: {
              allowPointSelect: false,
              dataLabels: { enabled: false },
              enableMouseTracking: false
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                          console.log(router.push(`/categories/${this.options.id}`))
                          console.log(this.options.id)
                        }
                    }
                }
            }
          },
          legend: { enabled: false },
          title: { text: this.chartTitle },
          xAxis: {
            categories: this.data.categories,
            crosshair: true,
            labels: { x: 0 }
          },
          yAxis: {
            title: { enabled: false },
            plotLines: [{
              value: 10620,
              label: {
                text: '10 620',
                align: 'right',
                x: 0,
                style: {
                  // color: 'white'
                }
              }
            }]
          },
          series: this.data.series,
          tooltip: {
            shared: true,
            enabled: false
          },
          credits: { enabled: false }
        })
      }
    }
  },

  mounted() {
    this.init()
  },

  beforeDestroy() {
    if (this.chart) this.chart.destroy()
  }
}
</script>
