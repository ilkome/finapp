<template lang="pug">
.content
  .module
    h1.title
      .icon(:class="`icon-${category.id}`"): .icon__pic
      .name {{ category.name }}
      .sup  {{ category.id }}

    .categoryStat
      .categoryStat__trns
        template(v-for="data of dataByYears")
          .itemStat
            .itemStat__content
              .itemStat__text
                .itemStat__name {{ data.year }}
                .itemStat__price
                  .income
                    template(v-if="data.incomes > 0") {{formatMoney(data.incomes)}}
                  .expense
                    template(v-if="data.expenses > 0") {{formatMoney(data.expenses)}}
              .itemStat__graph
                template(v-if="data.incomes > 0")
                  .itemStat__graph__in._income(:style="countWidthYear(data.incomes, 'income')")
                template(v-if="data.expenses > 0")
                  .itemStat__graph__in._expense(:style="countWidthYear(data.expenses, 'expense')")

      .categoryStat__summary
        .summaryShort
          .summaryShort__content
            template(v-if="total.expenses > 0 || total.incomes > 0")
              .summaryShort__el
                .accountDetails

                  .accountItem(v-if="total.expenses > 0")
                    .accountItem__label Expenses
                    .accountItem__total.expense {{ formatMoney(total.expenses) }}

                  .accountItem(v-if="total.incomes > 0")
                    .accountItem__label Incomes
                    .accountItem__total.income {{ formatMoney(total.incomes) }}

                  .accountItem
                    .accountItem__label Average
                    .accountItem__total {{ formatMoney((total.incomes - total.expenses) / 4) }}

                  .accountItem
                    .accountItem__label Total
                    .accountItem__total.sum {{ formatMoney(total.incomes - total.expenses) }}

  template(v-for="year of years")
    .module._bg
      h1.title._wide Year {{ year }}
      .categoryStat
        .categoryStat__trns
          template(v-for="data in dataInYear(year)")
            template(v-if="data.expenses > 0 || data.incomes > 0")
              .itemStat
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ data.month }}
                    .itemStat__price
                      .income
                        template(v-if="data.incomes > 0") {{formatMoney(data.incomes)}}
                      .expense
                        template(v-if="data.expenses > 0") {{formatMoney(data.expenses)}}
                  .itemStat__graph
                    template(v-if="data.incomes > 0")
                      .itemStat__graph__in._income(:style="countWidthMonth(data.incomes, 'income')")
                    template(v-if="data.expenses > 0")
                      .itemStat__graph__in._expense(:style="countWidthMonth(data.expenses, 'expense')")

        .categoryStat__summary
          .summaryShort
            .summaryShort__content
              template(v-if="totalInYear(year).expenses > 0 || totalInYear(year).incomes > 0")
                .summaryShort__el
                  .accountDetails

                    .accountItem(v-if="total.expenses > 0")
                      .accountItem__label Expenses
                      .accountItem__total.expense {{ formatMoney(totalInYear(year).expenses) }}

                    .accountItem(v-if="total.incomes > 0")
                      .accountItem__label Incomes
                      .accountItem__total.income {{ formatMoney(totalInYear(year).incomes) }}

                    .accountItem
                      .accountItem__label Average
                      .accountItem__total {{ formatMoney((totalInYear(year).incomes - totalInYear(year).expenses) / 12) }}

                    .accountItem
                      .accountItem__label Total
                      .accountItem__total.sum {{ formatMoney(totalInYear(year).incomes - totalInYear(year).expenses) }}
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

  computed: {
    ...mapGetters(['categories', 'trns']),

    category() {
      console.log(this.categories.find(a => a.id === +this.$route.params.id).id)
      return this.categories.find(a => a.id === +this.$route.params.id)
    },

    years() {
      const arr = []
      for (let i = 2017; i >= 2014; i--) {
        arr.push(i)
      }
      return arr
    },

    trnsList() {
      return this.trns.filter(trn => trn.categoryId === this.category.id)
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

      for (let year = 2014; year <= 2017; year++) {
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
      }

      return data
    },

    dataByYears() {
      const data = []

      for (let year = 2017; year >= 2014; year--) {
        const trnsInYear = this.trnsList.filter(trn => +moment(trn.date).format('Y') === year)
        console.log(year)

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
      }

      console.log(data)
      return data
    }
  },

  methods: {
    countWidthMonth(total, type) {
      let width = 0
      let dataSorted = []

      // incomes
      if (type === 'income') {
        dataSorted = orderBy(this.dataByMonths, e => e.incomes, 'desc')
        width = total / dataSorted[0].incomes * 100
      }

      // expense
      if (type === 'expense') {
        dataSorted = orderBy(this.dataByMonths, e => e.expenses, 'desc')
        width = total / dataSorted[0].expenses * 100
      }

      const renderWidth = width > 0 ? width : 0
      return {
        width: `calc(${renderWidth}%)`
      }
    },

    countWidthYear(total, type) {
      let width = 0
      let dataSorted = []

      // incomes
      if (type === 'income') {
        dataSorted = orderBy(this.dataByYears, e => e.incomes, 'desc')
        width = total / dataSorted[0].incomes * 100
      }

      // expense
      if (type === 'expense') {
        dataSorted = orderBy(this.dataByYears, e => e.expenses, 'desc')
        width = total / dataSorted[0].expenses * 100
      }

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
