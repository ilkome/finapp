<template lang="pug">
.content
  .module
    h1.title
      .icon.icon-incomes: .icon__pic
      | Total summary

    .categoryStat
      .categoryStat__trns._long
        h2.ml Years
        template(v-for="year of summaryYears.years")
          .itemStat._mb
            .itemStat__content
              .itemStat__text
                .itemStat__name {{ year.year }}
                .itemStat__price.incomes {{ formatMoney(year.incomes) }}
                .itemStat__price.expenses {{ formatMoney(year.expenses) }}
                .itemStat__price.sum {{ formatMoney(year.total) }}
              .itemStat__graph
                template(v-if="year.incomes > 0")
                  .itemStat__graph__in._income(:style="countWidth(year.incomes, summaryYears.biggestYear)")
                template(v-if="year.expenses > 0")
                  .itemStat__graph__in._expense(:style="countWidth(year.expenses, summaryYears.biggestYear)")

      .categoryStat__summary(v-if="summaryYears.years.length > 1")
        h2 Summary
        .summaryShort(v-if="summaryYears.expenses > 0 || summaryYears.incomes > 0")
          .summaryShort__item(v-if="summaryYears.incomes > 0")
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summaryYears.incomes) }}

          .summaryShort__item(v-if="summaryYears.expenses > 0")
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summaryYears.expenses) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summaryYears.total) }}

          .summaryShort__item(v-if="summaryYears.years.length > 1")
            .summaryShort__item__icon._year
            .summaryShort__item__label Year average
            .summaryShort__item__total.sum {{ formatMoney(summaryYears.yearAverageTotal) }}

          .summaryShort__item
            .summaryShort__item__icon._month
            .summaryShort__item__label Month average
            .summaryShort__item__total.sum {{ formatMoney(summaryYears.monthAverageTotal) }}

  .tabs
    template(v-for="year of summaryYears.years")
      a(@click="changeYear(year.year)", :class="{_active: showedYear === year.year}") {{ year.year }}

  template(v-for="year of summaryYears.years")
    template(v-if="showedYear === year.year")
      .module._bg
        .categoryStat
          .categoryStat__trns._long
            template(v-for="month in year.months")
              template(v-if="month.expenses > 0 || month.incomes > 0")
                .itemStat
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ month.month }}
                      .itemStat__price.incomes {{ formatMoney(month.incomes)}}
                      .itemStat__price.expenses  {{ formatMoney(month.expenses) }}
                      .itemStat__price {{ formatMoney(month.incomes - month.expenses) }}
                    .itemStat__graph
                      template(v-if="month.incomes > 0")
                        .itemStat__graph__in._income(:style="countWidth(month.incomes, year.biggestMonth)")
                      template(v-if="month.expenses > 0")
                        .itemStat__graph__in._expense(:style="countWidth(month.expenses, year.biggestMonth)")

          .categoryStat__summary
            .summaryShort(v-if="year.expenses > 0 || year.incomes > 0")
              .summaryShort__item(v-if="year.incomes > 0")
                .summaryShort__item__icon._incomes
                .summaryShort__item__label Incomes
                .summaryShort__item__total.incomes {{ formatMoney(year.incomes) }}

              .summaryShort__item(v-if="year.expenses > 0")
                .summaryShort__item__icon._expenses
                .summaryShort__item__label Expenses
                .summaryShort__item__total.expenses {{ formatMoney(year.expenses) }}

              .summaryShort__item
                .summaryShort__item__icon._total
                .summaryShort__item__label Total
                .summaryShort__item__total.sum {{ formatMoney(year.total) }}

              .summaryShort__item
                .summaryShort__item__icon._month
                .summaryShort__item__label Average
                .summaryShort__item__total.sum {{ formatMoney(year.average) }}
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatDataForCharts from '../mixins/formatDataForCharts'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney, formatDataForCharts],

  data() {
    return {
      showedYear: 2017
    }
  },

  computed: {
    ...mapGetters(['trns']),

    trnsList() {
      return this.trns.filter(t => t.categoryId !== 62)
    },

    summaryYears() {
      const dataYears = []

      // Find first and last year with trns
      let firstYear = +moment().format('Y')
      let lastYear = firstYear
      if (this.trnsList && this.trnsList.length > 0) {
        const firstTrn = this.trnsList[this.trnsList.length - 1]
        const lastTrn = this.trnsList[0]
        firstYear = +moment(firstTrn.date).format('Y')
        lastYear = +moment(lastTrn.date).format('Y')
      }
      const yearsCount = lastYear - firstYear + 1

      // Create data for every year
      for (let year = lastYear; year >= firstYear; year--) {
        const trnsInYear = this.trnsList
          .filter(trn => +moment(trn.date).format('Y') === +year)

        if (trnsInYear && trnsInYear.length > 0) {
          const dataMonths = []

          // Create data for every month
          for (let i = 1; i <= 12; i++) {
            const trnsInMonth = trnsInYear.filter(trn => +moment(trn.date).format('M') === i)
            const month = moment(i, 'M').format('MMMM')

            if (trnsInMonth.length > 0) {
              const monthIncomes = trnsInMonth
                .filter(trn => trn.type === 1)
                .reduce((sum, current) => sum + current.amountRub, 0)

              const monthExpenses = trnsInMonth
                .filter(trn => trn.type === 0)
                .reduce((sum, current) => sum + current.amountRub, 0)

              dataMonths.push({
                month,
                incomes: monthIncomes > 0 ? monthIncomes : 0,
                expenses: monthExpenses > 0 ? monthExpenses : 0,
                total: monthIncomes - monthExpenses
              })
            } else {
              dataMonths.push({
                month,
                incomes: 0,
                expenses: 0,
                total: 0
              })
            }
          }

          // Month summary in year
          if (dataMonths.length > 0) {
            const yearIncomes = dataMonths.reduce((sum, current) => sum + current.incomes, 0)
            const yearExpenses = dataMonths.reduce((sum, current) => sum + current.expenses, 0)
            const yearTotal = yearIncomes - yearExpenses

            // Find month with biggest spend in year
            const orderedMonths = orderBy(dataMonths, y => y.incomes > y.expenses ? y.incomes : y.expenses, 'desc')
            const biggestIncomes = orderedMonths[0].incomes
            const biggestExpenses = orderedMonths[0].expenses
            const biggestMonth = biggestIncomes > biggestExpenses ? biggestIncomes : biggestExpenses

            dataYears.push({
              year,
              months: dataMonths,
              incomes: yearIncomes,
              expenses: yearExpenses,
              total: yearTotal,
              average: yearTotal / 12,
              averageExpenses: yearExpenses / 12,
              biggestMonth
            })
          }
        }
      }

      // Work with year summary
      const allIncomes = dataYears.reduce((sum, current) => sum + current.incomes, 0)
      const allExpenses = dataYears.reduce((sum, current) => sum + current.expenses, 0)
      const allTotal = allIncomes - allExpenses

      // Find year with biggest spend
      const orderedYears = orderBy(dataYears, y => y.incomes > y.expenses ? y.incomes : y.expenses, 'desc')
      const biggestIncomes = orderedYears[0].incomes
      const biggestExpenses = orderedYears[0].expenses
      const biggestYear = biggestIncomes > biggestExpenses ? biggestIncomes : biggestExpenses

      return {
        incomes: allIncomes,
        expenses: allExpenses,
        total: allTotal,
        yearAverageIncomes: allIncomes / yearsCount,
        yearAverageExpenses: allExpenses / yearsCount,
        yearAverageTotal: allTotal / yearsCount,
        monthAverageIncomes: allIncomes / yearsCount / 12,
        monthAverageExpenses: allExpenses / yearsCount / 12,
        monthAverageTotal: allTotal / yearsCount / 12,
        biggestYear,
        years: dataYears
      }
    }
  },

  methods: {
    countWidth(total, biggest) {
      const width = total / biggest * 100
      const renderWidth = width > 0 ? width : 0
      return {
        width: `calc(${renderWidth}%)`
      }
    },

    changeYear(year) {
      this.showedYear = +year
    }
  }
}
</script>
