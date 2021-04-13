<script>
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'

export default {
  name: 'StatChartPie',

  components: {
    Chart
  },

  props: {
    chartType: {
      type: String,
      default: 'pie'
    },

    amountType: {
      type: String,
      default: null
    }
  },

  computed: {
    chartData () {
      const statCurrentPeriodCategories = this.$store.getters['stat/statCurrentPeriod'].categories
      const statCurrentPeriod = this.$store.getters['stat/statCurrentPeriod']
      const data = []

      for (const categoryId of statCurrentPeriod[this.amountType].categoriesIds) {
        const categoryAmountValues = statCurrentPeriodCategories[categoryId]
        const category = this.$store.state.categories.items[categoryId]
        if (categoryAmountValues[this.amountType] !== 0) {
          data.push({
            categoryId,
            color: category.color,
            name: category.name,
            y: categoryAmountValues[this.amountType]
          })
        }
      }

      const series = [{
        data,
        type: this.chartType
      }]

      return {
        ...chartOptions,
        series,

        chart: {
          ...chartOptions.chart,
          spacing: [0, 0, 0, 0],
          height: '100',

          events: {
            click (e) {
              // console.log(e)
              // const value = this.series[0].searchPoint(e, true) || this.series[1].searchPoint(e, true)
              // vm.$store.dispatch('filter/setDate', parseInt(value.date))
            }
          }
        },

        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...chartOptions.plotOptions.series,
            cursor: 'pointer',
            point: {
              events: {
                click (e) {
                  // console.log(e)
                  // vm.$store.dispatch('filter/setDate', parseInt(this.date))
                }
              }
            }
          }
        }
      }
    }
  }
}
</script>

<template lang="pug">
.chart
  Chart(:options="chartData")
</template>

<style lang="stylus" scoped>
.chart
  z-index 3
  position relative
  padding 0
</style>
