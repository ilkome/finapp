<script>
import { Chart } from 'highcharts-vue'

export default {
  components: {
    Chart
  },

  data () {
    return {
      chartData () {
        const categories = this.$store.state.categories.items
        const stat = this.$store.getters.stat.categories
        const seriesData = []
        for (const categoryId in stat) {
          seriesData.push({
            name: categories[categoryId].name,
            y: stat[categoryId].expenses,
            color: categories[categoryId].color
          })
        }
        return seriesData
      },

      chartOptions: {
        title: {
          text: null
        },

        chart: {
          type: 'pie'
        },

        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false
            }
          }
        },

        series: [{
          data: this.chartData
        }],

        chartOptions: {
          series: [{
            dataLabels: {
              enabled: false
            }
          }]
        }
      }
    }
  }
}
</script>

<template lang="pug">
div
  Chart(:options="chartOptions")
</template>

<style lang="stylus">
@import "~@/stylus/variables/margins"
</style>
