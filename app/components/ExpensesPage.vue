<template lang="pug">
.content
  .module
    h1.title._expenses
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
                .itemStat__price.expenses
                  div {{formatMoney(data.expenses)}}
              .itemStat__graph
                template(v-if="data.expenses > 0")
                  .itemStat__graph__in._expense(:style="countWidthYear(data.expenses)")

      .categoryStat__summary
        h2 Summary
        .summaryShort
          .summaryShort__content
            template(v-if="total.expenses > 0 || total.incomes > 0")
              .summaryItem
                .summaryItem__icon._expenses
                .summaryItem__label Expenses
                .summaryItem__total.expense {{ formatMoney(total.expenses) }}
              template(v-if="years.length > 1")
                .summaryItem
                  .summaryItem__icon._year
                  .summaryItem__label Year average
                  .summaryItem__total.sum {{ formatMoney(total.expenses / years.length) }}
              .summaryItem
                .summaryItem__icon._month
                .summaryItem__label Month average
                .summaryItem__total.sum {{ formatMoney(total.expenses / 4 / 12) }}

  .module._bg
    .module__in
      template(v-for="year of years")
        .module__cell
          h1.title._wide Year {{ year }}
          .summaryShort._year
            .summaryShort__content
              template(v-if="dataData(year).total > 0")
                .summaryItem
                  .summaryItem__icon._expenses
                  .summaryItem__label Expenses
                  .summaryItem__total.expense {{ formatMoney(dataData(year).total) }}
                .summaryItem
                  .summaryItem__icon._month
                  .summaryItem__label Month average
                  template(v-if="year === 2017")
                    .summaryItem__total.sum {{ formatMoney(dataData(year).total / 5) }}
                  template(v-else)
                    .summaryItem__total.sum {{ formatMoney(dataData(year).total / 12) }}

          .trns._limitHeight
            template(v-for="category in dataData(year).categories")
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
                    .itemStat__graph__in._expense(:style="countWidth(category.total, dataData(year).categories)")
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
      showedTab: 2017
    }
  },

  computed: {
    ...mapGetters(['trns']),

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

      this.years.forEach((year) => {
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

    dataData(year) {
      const trns = this.trnsList
        .filter(trn => +moment(trn.date).format('Y') === +year)

      if (trns && trns.length > 0) {
        const catsIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)
        const data = []

        catsIds.forEach((id) => {
          const expensesTotal = trns
            .filter(t => t.categoryId === id && t.type === 0)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const total = expensesTotal

          if (total > 0) {
            const name = this.categories.find(c => c.id === id).name
            data.push({ id, name, total })
          }
        })

        if (data.length > 0) {
          const dataSorted = orderBy(data, d => d.total, 'desc')
          return {
            categories: dataSorted,
            total: data.reduce((sum, current) => sum + current.total, 0)
          }
        }
      }
      return false
    }
  },

  components: { SummaryShort }
}
</script>
