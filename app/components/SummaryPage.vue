<template lang="pug">
.content
  .module
    h1.title._incomes
      .icon.icon-incomes: .icon__pic
      | Total summary

    .categoryStat
      .categoryStat__trns._long
        h2.ml Years
        template(v-for="data of dataByYears")
          .itemStat._mb
            .itemStat__content
              .itemStat__text
                .itemStat__name {{ data.year }}
                .itemStat__price.income
                  div {{formatMoney(data.incomes)}}
                .itemStat__price.expense
                  div {{formatMoney(data.expenses)}}
                .itemStat__price
                  div {{formatMoney(data.incomes - data.expenses)}}
              .itemStat__graph
                template(v-if="data.incomes > 0")
                  .itemStat__graph__in._income(:style="countWidthYear(data.incomes)")
                template(v-if="data.expenses > 0")
                  .itemStat__graph__in._expense(:style="countWidthYear(data.expenses)")

      .categoryStat__summary
        h2 Summary
        .summaryShort
          .summaryShort__content
            template(v-if="total.expenses > 0 || total.incomes > 0")
              .summaryItem(v-if="total.incomes > 0")
                .summaryItem__icon._incomes
                .summaryItem__label Incomes
                .summaryItem__total.income {{ formatMoney(total.incomes) }}
              .summaryItem(v-if="total.expenses > 0")
                .summaryItem__icon._expenses
                .summaryItem__label Expenses
                .summaryItem__total.expense {{ formatMoney(total.expenses) }}
              .summaryItem
                .summaryItem__icon._total
                .summaryItem__label Total
                .summaryItem__total.sum {{ formatMoney(total.incomes - total.expenses) }}
              template(v-if="years.length > 1")
                .summaryItem
                  .summaryItem__icon._year
                  .summaryItem__label Year average
                  .summaryItem__total.sum {{ formatMoney((total.incomes - total.expenses) / years.length) }}
              .summaryItem
                .summaryItem__icon._month
                .summaryItem__label Month average
                .summaryItem__total.sum {{ formatMoney((total.incomes - total.expenses) / years.length / 12) }}

  .tabs
    template(v-for="year of years")
      a(@click="changeYear(year)", :class="{_active: showedYear === year}") {{ year }}

  template(v-for="year of years")
    template(v-if="showedYear === year")
      .module._bg
        .categoryStat
          .categoryStat__trns._long
            template(v-for="data in dataInYear(year)")
              template(v-if="data.expenses > 0 || data.incomes > 0")
                .itemStat
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ data.month }}
                      .itemStat__price.income
                        div {{formatMoney(data.incomes)}}
                      .itemStat__price.expense
                        div {{formatMoney(data.expenses)}}
                      .itemStat__price
                        div {{formatMoney(data.incomes - data.expenses)}}
                    .itemStat__graph
                      template(v-if="data.incomes > 0")
                        .itemStat__graph__in._income(:style="countWidthMonth(data.incomes)")
                      template(v-if="data.expenses > 0")
                        .itemStat__graph__in._expense(:style="countWidthMonth(data.expenses)")

          .categoryStat__summary
            .summaryShort
              .summaryShort__content
                template(v-if="totalInYear(year).expenses > 0 || totalInYear(year).incomes > 0")
                  .summaryItem(v-if="total.incomes > 0")
                    .summaryItem__icon._incomes
                    .summaryItem__label Incomes
                    .summaryItem__total.income {{ formatMoney(totalInYear(year).incomes) }}
                  .summaryItem(v-if="total.expenses > 0")
                    .summaryItem__icon._expenses
                    .summaryItem__label Expenses
                    .summaryItem__total.expense {{ formatMoney(totalInYear(year).expenses) }}
                  .summaryItem
                    .summaryItem__icon._total
                    .summaryItem__label Total
                    .summaryItem__total.sum {{ formatMoney(totalInYear(year).incomes - totalInYear(year).expenses) }}
                  .summaryItem
                    .summaryItem__icon._month
                    .summaryItem__label Average
                    .summaryItem__total.sum {{ formatMoney((totalInYear(year).incomes - totalInYear(year).expenses) / 12) }}
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatDataForCharts from '../mixins/formatDataForCharts'
import formatMoney from '../mixins/formatMoney'
import SummaryShort from './SummaryShort.vue'

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

    total() {
      const incomes = this.trnsList
        .filter(trn => trn.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0)

      const expenses = this.trnsList
        .filter(trn => trn.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0)

      return {
        expenses,
        incomes
      }
    },

    dataByMonths() {
      let data = []

      this.years.forEach((year) => {
        const trnsInYear = this.trnsList.filter(trn => +moment(trn.date).format('Y') === year)

        for (let month = 1; month <= 12; month++) {
          const trnsInMonth = trnsInYear.filter(trn => +moment(trn.date).format('M') === month)
          const month = moment(month, 'M').format('MMMM')

          if (trnsInMonth.length > 0) {
            const incomesTotal = trnsInMonth
              .filter(trn => trn.type === 1)
              .reduce((sum, current) => sum + current.amountRub, 0)
            const expensesTotal = trnsInMonth
              .filter(trn => trn.type === 0)
              .reduce((sum, current) => sum + current.amountRub, 0)

            data = [...data, {
              month,
              year,
              incomes: incomesTotal > 0 ? incomesTotal : 0,
              expenses: expensesTotal > 0 ? expensesTotal : 0
            }]
          } else {
            data = [...data, {
              month,
              year,
              incomes: 0,
              expenses: 0
            }]
          }
        }
      })

      return data
    },

    dataByYears() {
      const data = []

      this.years.forEach((year) => {
        const trnsInYear = this.trnsList.filter(trn => +moment(trn.date).format('Y') === year)

        if (trnsInYear.length > 0) {
          const incomesTotal = trnsInYear
            .filter(trn => trn.type === 1)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const expensesTotal = trnsInYear
            .filter(trn => trn.type === 0)
            .reduce((sum, current) => sum + current.amountRub, 0)
          data.push({
            year,
            incomes: incomesTotal > 0 ? incomesTotal : 0,
            expenses: expensesTotal > 0 ? expensesTotal : 0
          })
        } else {
          data.push({
            year,
            incomes: 0,
            expenses: 0
          })
        }
      })

      return data
    },

    years() {
      const trns = this.trnsList.filter(trn => trn.categoryId !== 62)
      const firstTrn = trns[trns.length - 1]
      let fromYear = 2017
      if (firstTrn) fromYear = +moment(firstTrn.date).format('Y')
      const arr = []

      for (let i = 2017; i >= fromYear; i--) {
        arr.push(i)
      }
      return arr
    }
  },

  methods: {
    changeYear(year) {
      this.showedYear = +year
    },

    countWidthMonth(total) {
      const dataSorted = orderBy(this.dataByMonths, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
      const biggest = dataSorted[0].incomes > dataSorted[0].expenses ? dataSorted[0].incomes : dataSorted[0].expenses
      const width = total / biggest * 100
      const renderWidth = width > 0 ? width : 0
      return {
        width: `calc(${renderWidth}%)`
      }
    },

    countWidthYear(total) {
      const dataSorted = orderBy(this.dataByYears, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')
      const biggest = dataSorted[0].incomes > dataSorted[0].expenses ? dataSorted[0].incomes : dataSorted[0].expenses
      const width = total / biggest * 100
      const renderWidth = width > 0 ? width : 0
      return {
        width: `calc(${renderWidth}%)`
      }
    },

    totalInYear(year) {
      const incomes = this.trnsList
        .filter(trn => trn.type === 1 && +moment(trn.date).format('Y') === +year)
        .reduce((sum, current) => sum + current.amountRub, 0)

      const expenses = this.trnsList
        .filter(trn => trn.type === 0 && +moment(trn.date).format('Y') === +year)
        .reduce((sum, current) => sum + current.amountRub, 0)

      return {
        expenses,
        incomes
      }
    },

    dataInYear(year) {
      if (!year) {
        console.log('Year is not set.')
        return false
      }

      const trnsInYear = this.trnsList.filter(trn => +moment(trn.date).format('Y') === +year)
      const data = []

      for (let i = 1; i <= 12; i++) {
        const trnsInMonth = trnsInYear.filter(trn => +moment(trn.date).format('M') === i)
        const month = moment(i, 'M').format('MMMM')

        if (trnsInMonth.length > 0) {
          const incomesTotal = trnsInMonth
            .filter(trn => trn.type === 1)
            .reduce((sum, current) => sum + current.amountRub, 0)

          const expensesTotal = trnsInMonth
            .filter(trn => trn.type === 0)
            .reduce((sum, current) => sum + current.amountRub, 0)

          data.push({
            month,
            incomes: incomesTotal > 0 ? incomesTotal : 0,
            expenses: expensesTotal > 0 ? expensesTotal : 0
          })
        } else {
          data.push({
            month,
            incomes: 0,
            expenses: 0
          })
        }
      }

      return data
    }
  },

  components: { SummaryShort }
}
</script>
