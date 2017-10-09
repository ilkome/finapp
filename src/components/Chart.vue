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
      const categories = this.data.categories

      if (!this.chart) {
        Highcharts.setOptions(chartTheme)
        this.chart = new Highcharts.Chart(this.$el, {
          chart: {
            type: this.chartType
          },

          plotOptions: {
            // area: {
            //   dataLabels: { enabled: true }
            //   // enableMouseTracking: true
            // },
            column: {
              pointWidth: 45,
              maxPointWidth: 100,
              // allowPointSelect: true,
              dataLabels: {
                enabled: true
              },
              
            },
            // pie: {
            //   allowPointSelect: false,
            //   dataLabels: { enabled: false },
            //   enableMouseTracking: false
            // },

            series: {
              // cursor: 'pointer',
              borderWidth: 0,
              point: {
                events: {
                  click: function () {
                    console.log(this.options)
                  }
                }
              }
            }
          },
          title: { text: this.chartTitle },
          xAxis: {
            categories: categories.map(cat => cat.name),
            // crosshair: true,
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
          // yAxis: {
          //   title: { enabled: false },
          //   plotLines: [{
          //     value: 10620,
          //     label: {
          //       text: '10 620',
          //       align: 'right',
          //       x: 0,
          //       style: {
          //         // color: 'white'
          //       }
          //     }
          //   }]
          // },
          series: this.data.series,
          tooltip: {
            shared: true,
            enabled: true
          },
          
          credits: { 
            enabled: false
          },
          legend: {
            enabled: false
          },
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
