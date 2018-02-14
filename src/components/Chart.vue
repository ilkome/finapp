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
      if (this.chartType === 'pie') return '_pie'
      return '_column'
    }
  },

  watch: {
    data() {
      if (this.chart) {
        const categories = this.data.series[0].data

        this.chart.update({
          ...this.data,
          xAxis: {
            categories: categories.map(cat => cat),
            labels: {
              formatter() {
                const currentCategory = categories[this.pos]
                if (currentCategory) {
                  return `
                      <div class="icon" style="background: ${currentCategory.color}">
                      <div class="${currentCategory.icon}"></div>
                      </div>`
                }
              }
            }
          }
        })
      }
    }
  },

  methods: {
    init() {
      const categories = this.data.series[0].data

      if (!this.chart) {
        Highcharts.setOptions(chartTheme)
        this.chart = new Highcharts.Chart(this.$el, {
          chart: {
            type: this.chartType
          },
          legend: {
            enabled: false,
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
            pie: {
              dataLabels: {
                enabled: false
              }
            },
            column: {
              pointWidth: 35,
              maxPointWidth: 35
            },
            series: {
              borderWidth: 0
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
            crosshair: false,
            labels: {
              rotation: 0,
              useHTML: true,
              formatter() {
                const currentCategory = categories[this.pos]
                if (currentCategory) {
                  return `
                  <div class="icon" style="background: ${currentCategory.color}">
                  <div class="${currentCategory.icon}"></div>
                  </div>`
                }
              }
            }
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
