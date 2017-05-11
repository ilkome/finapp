<template lang="pug">
.content
  .module
    h1.title
      .icon(:class="`icon-${category.id}`"): .icon__pic
      .name {{ category.name }}
      .sup  {{ category.id }}

    SummaryShort(
      :expenses="total.expenses",
      :incomes="total.incomes")

  template(v-for="year of years")
    .module._bg
      h1.title._wide Year {{ year }}
      .categoryStat
        .categoryStat__trns
          template(v-for="(yearData, index) in trnsData(year)")
            template(v-if="yearData.expenses > 0 || yearData.incomes > 0")
              .itemStat
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ yearData.month }}
                    .itemStat__price
                      .income(v-if="yearData.incomes > 0") {{formatMoney(yearData.incomes)}}
                      .expense(v-if="yearData.expenses > 0") {{formatMoney(yearData.expenses)}}
                  .itemStat__graph
                    template(v-if="yearData.incomes > 0")
                      .itemStat__graph__in._income(:style="countWidthStyleNew(yearData.incomes, 'income')")
                    template(v-if="yearData.expenses > 0")
                      .itemStat__graph__in._expense(:style="countWidthStyleNew(yearData.expenses, 'expense')")

        .categoryStat__summary
          .summaryShort
            .summaryShort__content
              template(v-if="totalInYear(year).expenses > 0 || totalInYear(year).incomes > 0")
                .summaryShort__el
                  .accountDetails

                    .accountItem
                      .accountItem__label Expense
                      .accountItem__total.expense {{ formatMoney(totalInYear(year).expenses) }}

                    .accountItem
                      .accountItem__label Income
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
import formatDataForCharts from '../mixins/formatDataForCharts'
import formatMoney from '../mixins/formatMoney'
import SummaryShort from './SummaryShort.vue'

export default {
  mixins: [formatMoney, formatDataForCharts],

  computed: {
    ...mapGetters(['categories', 'trns']),

    category() {
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

    trnsListSorted() {
      const data = []

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

            data.push({
              month,
              year,
              incomes: incomesTotal > 0 ? incomesTotal : 0,
              expenses: expensesTotal > 0 ? expensesTotal : 0
            })
          } else {
            data.push({
              month,
              year,
              incomes: 0,
              expenses: 0
            })
          }
        }
      }

      const dataSorted = data.sort((a, b) => {
        const aBiggest = (a.incomes > a.expenses) ? a.incomes : a.expenses
        const bBiggest = (b.incomes > b.expenses) ? b.incomes : b.expenses

        if (aBiggest > bBiggest) return -1
        else if (aBiggest < bBiggest) return 1
        return 0
      })

      return dataSorted
    }
  },

  methods: {
    countWidthStyleNew(total, type) {
      let width = 0

      if (type === 'income') {
        width = total / this.trnsListSorted[0].incomes * 100
      } else {
        width = total / this.trnsListSorted[0].expenses * 100
      }

      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
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

    trnsData(year) {
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
