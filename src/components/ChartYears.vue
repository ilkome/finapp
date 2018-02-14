<template lang="pug">
.chartYearsList
  template(
    v-if="selectedCategoryGraph"
    v-for="year in selectedCategoryGraph"
  )
    .chartYearsList__item
      .chart-year-item__wrap
        .yearStatNumbers
          .yearChart__stat
            .moneyBlock
              .moneyBlock__line
                .moneyTitle.expenses Expenses
                .moneyBlock__total.expenses {{ formatMoney(year.totalExpensesInYear) }}
              .moneyBlock__line
                .moneyBlock__title
                  .mdi.mdi-chart-timeline
                  div Average
                .moneyBlock__total: .sum {{ formatMoney(0) }}

            .moneyBlock
              .moneyBlock__line
                .moneyTitle.incomes Incomes
                .moneyBlock__total.incomes {{ formatMoney(year.totalIncomesInYear) }}
              .moneyBlock__line
                .moneyBlock__title
                  .mdi.mdi-chart-timeline
                  div Average
                .moneyBlock__total: .sum {{ formatMoney(0) }}

            .moneyBlock
              .moneyBlock__line
                .moneyTitle Total
                .moneyBlock__total: .sum {{ formatMoney(year.totalSumInYear) }}
              .moneyBlock__line
                .moneyBlock__title
                  .mdi.mdi-chart-timeline
                  div Average
                .moneyBlock__total: .sum {{ formatMoney(0) }}

        .yearChart._alt
          .yearChart__title {{ year.name }}
          .yearChartFix
            .yearChart
              .statChart__in
                template(v-for="(period, index) in year.months")
                  .statChart__item._small(
                    @click.prevent="$emit('setDashboardDate', period.date)"
                  )
                    template(v-if="!$store.state.isMobile")
                      .tooltip
                        .tooltip__in
                          .tooltip__incomes {{ formatMoney(period.incomes) }}
                          .tooltip__expenses {{ formatMoney(period.expenses) }}
                    .yearChartGraph
                      template(v-if="period.expenses <= 0 && period.incomes <= 0")
                        .statChartGraph__in._empty
                      template(v-else)
                        template(v-if="period.expenses > 0")
                          .statChartGraph__in._expenses(:style="getPeriodStaticHeight(period.expenses, year.biggestMonth)")
                        template(v-if="period.incomes > 0")
                          .statChartGraph__in._incomes(:style="getPeriodStaticHeight(period.incomes, year.biggestMonth)")
                    .statChart__values
                      .statChart__name {{ period.shortName }}
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    return {
      maxShowedYears: 1
    }
  },

  computed: {
    ...mapGetters(['getTrns', 'getFilter']),
    selectedCategoryGraph() {
      if (!this.$store.state.isMobile) {
        const stat = []
        const trnSelectedCategory = this.getTrns({
          accountId: this.getFilter.account && this.getFilter.account.id,
          categoryId: this.getFilter.category && this.getFilter.category.id
        })

        if (trnSelectedCategory.length) {
          // Get first and last years
          const currentYear = moment().startOf('year')
          const firstYear = moment(trnSelectedCategory[trnSelectedCategory.length - 1].date).startOf('year')
          const allYears = currentYear.diff(firstYear, 'year')

          // For every year
          for (let year = 0; year <= allYears; year++) {
            const months = []
            const name = moment().startOf('year').subtract(year, 'year').format('Y')

            // Get months data in every year
            for (let month = 0; month <= 11; month++) {
              const trns = trnSelectedCategory
                .filter(trn =>
                  moment(trn.date).startOf('month').valueOf() === moment().startOf('year').subtract(year, 'year').add(month, 'month').valueOf())
              const incomes = trns
                .filter(trn => trn.type === 1)
                .reduce((sum, current) => sum + current.amountRub, 0)
              const expenses = trns
                .filter(trn => trn.type === 0)
                .reduce((sum, current) => sum + current.amountRub, 0)
              const date = moment().startOf('year').subtract(year, 'year').add(month, 'month')
              const name = date.format('MMMM YY')
              const shortName = date.format('MMM')
              months.push({
                name,
                date,
                shortName,
                incomes,
                expenses
              })
            }
            let monthsLenght = []
            monthsLenght = months.filter(m => (m.incomes || m.expenses) > 0).length
            const totalIncomesInYear = months.reduce((sum, current) => sum + current.incomes, 0)
            const totalExpensesInYear = months.reduce((sum, current) => sum + current.expenses, 0)
            const totalSumInYear = totalIncomesInYear - totalExpensesInYear
            const monthAverage = totalSumInYear / 12
            const realMonthAverage = totalSumInYear / monthsLenght

            const sortedMonths = orderBy(months, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
            const biggestMonth = sortedMonths[0].incomes > sortedMonths[0].expenses ? sortedMonths[0].incomes : sortedMonths[0].expenses

            stat.push({
              name,
              months,
              biggestMonth,
              totalIncomesInYear,
              totalExpensesInYear,
              totalSumInYear,
              monthAverage,
              realMonthAverage,
              monthsLenght
            })
          }

          return stat
        }
      }
    },

    biggestMonth() {
      if (this.selectedCategoryGraph.length) {
        console.log(this.selectedCategoryGraph.length)
        const sortedMonths = orderBy(this.selectedCategoryGraph, e => e.biggestMonth, 'desc')
        console.log(sortedMonths)
        const biggestMonth = sortedMonths[0].biggestMonth
        return biggestMonth
      } else {
        return 0
      }
    }
  },

  methods: {
    getPeriodStaticHeight(value, biggest) {
      const height = value / biggest * 100
      let renderHeight
      if (height > 0) {
        renderHeight = height > 1 ? height : 1
      } else {
        renderHeight = 0
      }
      return {
        height: `calc(${renderHeight}%)`
      }
    }
  }
}
</script>
