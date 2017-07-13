<template lang="pug">
.content
  .module
    h1.title
      .icon.icon-incomes: .icon__pic
      | Expenses

    .categoryStat(v-if="summaryYears.years.length > 1")
      .categoryStat__trns
        h2.ml Years
        template(v-for="year of summaryYears.years")
          .itemStat
            .itemStat__in
              .itemStat__content
                .itemStat__text
                  .itemStat__name {{ year.year }}
                  .itemStat__price.expenses {{ formatMoney(year.total) }}
                .itemStat__graph
                  template(v-if="year.total > 0")
                    .itemStat__graph__in._expense(:style="countWidth(year.total, summaryYears.biggestYear)")

      .categoryStat__summary
        h2 Summary
        .summaryShort(v-if="summaryYears.total > 0")
          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summaryYears.total) }}

          .summaryShort__item(v-if="summaryYears.years.length > 1")
            .summaryShort__item__icon._year
            .summaryShort__item__label Year average
            .summaryShort__item__total.sum {{ formatMoney(summaryYears.yearAverage) }}

          .summaryShort__item
            .summaryShort__item__icon._month
            .summaryShort__item__label Month average
            .summaryShort__item__total.sum {{ formatMoney(summaryYears.monthAverage) }}

  .module._bg
    .module__in
      template(v-for="year of summaryYears.years")
        .yearStat
          h1.title._wide Year {{ year.year }}
          .summaryShort._pb
            .summaryShort__item
              .summaryShort__item__icon._expenses
              .summaryShort__item__label Expenses
              .summaryShort__item__total.expenses {{ formatMoney(year.total) }}

            .summaryShort__item
              .summaryShort__item__icon._month
              .summaryShort__item__label Month average
              .summaryShort__item__total.sum {{ formatMoney(year.average) }}

          .trns._limitHeight
            template(v-for="category in year.categories")
              .itemStat
                .itemStat__in
                  router-link.itemStat__icon(
                    :to="`/categories/${category.id}`",
                    title="Перейти в категорию"
                  )
                    .icon(:class="`icon-${category.parentId} icon-${category.id}`"): .icon__pic
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ category.name }}
                      .itemStat__price {{ formatMoney(category.total) }}
                    .itemStat__graph
                      .itemStat__graph__in._expense(:style="countWidth(category.total, year.biggestCategory)")
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns', 'categories']),

    trnsList() {
      return this.trns.filter(t => t.categoryId !== 62) // disable category 'Перевод')
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

      // Create categories data for every year
      for (let year = lastYear; year >= firstYear; year--) {
        const trnsInYear = this.trnsList
          .filter(trn => +moment(trn.date).format('Y') === +year)

        if (trnsInYear && trnsInYear.length > 0) {
          const dataCategories = []
          this.categories.forEach((category) => {
            const categoryExpenses = trnsInYear
              .filter(t => t.categoryId === category.id && t.type === 0)
              .reduce((sum, current) => sum + current.amountRub, 0)

            if (categoryExpenses > 0) {
              const categoryName = this.categories.find(c => c.id === category.id).name

              dataCategories.push({
                id: category.id,
                parentId: category.parentId,
                name: categoryName,
                total: categoryExpenses
              })
            }
          })

          // Summary in year
          if (dataCategories.length > 0) {
            const yearTotal = dataCategories.reduce((sum, current) => sum + current.total, 0)

            // Find category with biggest spend in year
            const categoriesSorted = orderBy(dataCategories, c => c.total, 'desc')
            const biggestCategory = categoriesSorted[0].total

            dataYears.push({
              year,
              categories: categoriesSorted,
              total: yearTotal,
              average: yearTotal / 12,
              biggestCategory
            })
          }
        }
      }

      // Work with year summary
      const allTotal = dataYears.reduce((sum, current) => sum + current.total, 0)

      // Find year with biggest spend
      const orderedYears = orderBy(dataYears, y => y.total, 'desc')
      const biggestYear = orderedYears[0].total

      return {
        total: allTotal,
        yearAverage: allTotal / yearsCount,
        monthAverage: allTotal / yearsCount / 12,
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

    toogleShowAll() {
      this.showNetStat = !this.showNetStat
    }
  }
}
</script>
