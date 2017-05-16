<template lang="pug">
.content
  .module
    h1.title._incomes
      .icon.icon-incomes: .icon__pic
      | Expenses

    .categoryStat
      .categoryStat__trns
        h2.ml Years
        template(v-for="data of dataByYears")
          .itemStat._mb
            .itemStat__content
              .itemStat__text
                .itemStat__name {{ data.year }}
                .itemStat__price.expense
                  div {{formatMoney(data.expenses)}}
              .itemStat__graph
                template(v-if="data.expenses > 0")
                  .itemStat__graph__in._expense(:style="countWidthYear(data.expenses)")

      .categoryStat__summary
        h2 Summary
        .summaryShort
          .summaryShort__content
            template(v-if="total.expenses > 0 || total.incomes > 0")
              .summaryShort__el
                .accountDetails
                  .summaryItem
                    .summaryItem__icon._expenses
                    .summaryItem__label Expenses
                    .summaryItem__total.expense {{ formatMoney(total.expenses) }}
                  .summaryItem
                    .summaryItem__icon._year
                    .summaryItem__label Year average
                    .summaryItem__total.sum {{ formatMoney(total.expenses / 4) }}
                  .summaryItem
                    .summaryItem__icon._month
                    .summaryItem__label Month average
                    .summaryItem__total.sum {{ formatMoney(total.expenses / 4 / 12) }}

  template(v-for="year of years")
    .module._bg
      h1.title._wide Year {{ year }}
      .categoryStat
        .categoryStat__trns
          .categoryStat__trnsIn
            template(v-for="category in expensesData(year)")
              router-link.itemStat(
                :to="`/categories/${category.id}`",
                title="Перейти в категорию"
              )
                .itemStat__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ category.name }}
                    .itemStat__price
                      div {{ formatMoney(category.total) }}
                  .itemStat__graph
                    .itemStat__graph__in._expense(:style="countWidth(category.total, expensesData(year))")

        .categoryStat__summary
          .summaryShort
            .summaryShort__content
              template(v-if="totalInYear(year).expenses > 0 || totalInYear(year).expenses > 0")
                .summaryShort__el
                  .accountDetails
                    .summaryItem
                      .summaryItem__icon._expenses
                      .summaryItem__label Expenses
                      .summaryItem__total.expense {{ formatMoney(totalInYear(year).expenses) }}

                    .summaryItem
                      .summaryItem__icon._month
                      .summaryItem__label Month average
                      template(v-if="year === 2017")
                        .summaryItem__total.sum {{ formatMoney(totalInYear(year).expenses / 5) }}
                      template(v-else)
                        .summaryItem__total.sum {{ formatMoney(totalInYear(year).expenses / 12) }}
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'
import formatDataForCharts from '../mixins/formatDataForCharts'
import formatMoney from '../mixins/formatMoney'
import SummaryShort from './SummaryShort.vue'

export default {
  mixins: [formatMoney, formatDataForCharts],

  data() {
    return {
      slice: 20
    }
  },

  computed: {
    ...mapGetters(['trns']),

    years() {
      const arr = []
      for (let i = 2017; i >= 2014; i--) {
        arr.push(i)
      }
      return arr
    },

    trnsList() {
      return this.trns.filter(t => t.categoryId !== 62) // disable category 'Перевод')
    },

    total() {
      const incomes = this.trnsList
        .filter(t => t.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0)

      const expenses = this.trnsList
        .filter(t => t.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0)

      return {
        expenses,
        incomes
      }
    },

    dataByYears() {
      const data = []

      for (let year = 2017; year >= 2014; year--) {
        const trnsInYear = this.trnsList
        .filter(t => +moment(t.date).format('Y') === year)

        if (trnsInYear.length > 0) {
          const incomesTotal = trnsInYear
            .filter(t => t.type === 1)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const expensesTotal = trnsInYear
            .filter(t => t.type === 0)
            .reduce((sum, current) => sum + current.amountRub, 0)
          data.push({
            year,
            incomes: incomesTotal > 0 ? incomesTotal : 0,
            expenses: expensesTotal > 0 ? expensesTotal : 0
          })
        }
      }

      return data
    }
  },

  methods: {
    countWidth(total, trns) {
      const width = total / trns[0].total * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
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

    expensesData(year) {
      const trns = this.trnsList
        .filter(trn => trn.type === 0 && +moment(trn.date).format('Y') === +year)

      if (trns && trns.length > 0) {
        // Create array of categories ids
        const catsIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)

        // Create array of objects with categories data
        const data = catsIds.map((id) => {
          const incomesTotal = trns
            .filter(t => t.categoryId === id && t.type === 1)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const expensesTotal = trns
            .filter(t => t.categoryId === id && t.type === 0)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const total = incomesTotal - expensesTotal
          const name = this.categories.find(c => c.id === id).name
          return { id, name, total }
        })

        const dataSorted = orderBy(data, d => d.total, 'asc')
        return dataSorted
      }

      return false
    },

    showMore() {
      this.slice = this.slice + 5
    }
  },

  components: { SummaryShort }
}
</script>
