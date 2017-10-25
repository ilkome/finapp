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
    }
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
        const categories = this.data.categories

        this.chart.update({
          ...this.data,
          xAxis: {
            categories: categories.map(cat => cat)
          }
        })
      }
    }
  },

  methods: {
    init() {
      const vm = this
      const categories = this.data.categories

      if (!this.chart) {
        Highcharts.setOptions(chartTheme)
        this.chart = new Highcharts.Chart(this.$el, {
          chart: {
            type: this.chartType
          },
          legend: {
            align: 'left',
            // layout: 'vertical',
            verticalAlign: 'top',
            x: 50,
            y: -10,
            backgroundColor: 'hsla(0, 0%, 0%, .5)',
            floating: true,
            itemStyle: {
              color: '#ababab'
            },
            itemMarginBottom: 3,
            itemHoverStyle: {
              color: '#ababab'
            }
          },

          plotOptions: {
            column: {
              maxPointWidth: 45
            },
            series: {
              cursor: 'pointer',
              borderWidth: 0,
              point: {
                events: {
                  click() {
                    vm.$emit('selectPeriodStat', this.options.idx)
                  }
                }
              }
            }
          },
          title: {
            text: '',
            style: {
              display: 'none'
            }
          },
          xAxis: {
            categories: categories.map(cat => cat),
            crosshair: true
          },
          yAxis: {
            title: {
              enabled: false
            }
          },
          series: this.data.series,
          tooltip: {
            shared: true,
            enabled: true
          },
          credits: {
            enabled: false
          }
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
