<template lang="pug">
.content
  template(v-if="category")
    .module
      .module-in
        h1.title
          template(v-if="parentCategory")
            router-link.icon._link(
              :to="`/categories/${parentCategory.id}`",
              title="Go to category"
              :style="`background: ${parentCategory.color}`"
            )
              div(:class="parentCategory.icon")
            .name {{ parentCategory.name }}
            .sup  {{ parentCategory.id }}
            .name

          .icon(:style="`background: ${category.color}`")
            div(:class="category.icon")
          .name {{ category.name }}
          .sup  {{ category.id }}

        template(v-if="trnsList.length")
          .viewStat
            .viewStat__item._summary
              h3.title._mbs Summary
              .summaryShort
                .summaryShort__content
                  template(v-if="total.expenses > 0 || total.incomes > 0")
                    .summaryShort__el
                      .accountDetails
                        .summaryShort__item(v-if="total.expenses > 0")
                          .summaryShort__item__icon._expenses
                          .summaryShort__item__label Expenses
                          .summaryShort__item__total.expenses {{ formatMoney(total.expenses) }}
                        .summaryShort__item(v-if="total.incomes > 0")
                          .summaryShort__item__icon._incomes
                          .summaryShort__item__label Incomes
                          .summaryShort__item__total.incomes {{ formatMoney(total.incomes) }}
                        .summaryShort__item(v-if="total.expenses > 0 && total.incomes > 0")
                          .summaryShort__item__icon._total
                          .summaryShort__item__label Total
                          .summaryShort__item__total.sum {{ formatMoney(total.incomes - total.expenses) }}
                        template(v-if="years.length > 1")
                          .summaryShort__item
                            .summaryShort__item__icon._year
                            .summaryShort__item__label Year average
                            .summaryShort__item__total.sum {{ formatMoney((total.incomes - total.expenses) / dataByYears.length) }}
                        .summaryShort__item
                          .summaryShort__item__icon._month
                          .summaryShort__item__label Month average
                          .summaryShort__item__total.sum {{ formatMoney((total.incomes - total.expenses) / dataByYears.length / 12) }}

              .panel(v-if="childCategories.length > 0")
                label.checkbox
                  input.checkbox__input(type="checkbox" v-model="showChild")
                  .checkbox__name Include child
                div(v-for="category in childCategories")
                  router-link.link(
                    :to="`/categories/${category.id}`",
                    title="Go to category"
                  ) {{ category.name }}

            .viewStat__item._stat
              h3.title._mbs Years
              template(v-for="data of dataByYears")
                .itemStat
                  .itemStat__in
                    .itemStat__content
                      .itemStat__text
                        .itemStat__name {{ data.year }}
                        .itemStat__price.incomes(v-if="data.incomes > 0 && Math.abs(data.total) !== data.incomes") {{ formatMoney(data.incomes) }}
                        .itemStat__price.expenses(v-if="data.expenses > 0 && Math.abs(data.total) !== data.expenses") {{ formatMoney(data.expenses) }}
                        .itemStat__price.sum {{ formatMoney(data.total) }}
                      .itemStat__graph
                        template(v-if="data.incomes > 0")
                          .itemStat__graph__in._income(:style="countWidthYear(data.incomes)")
                        template(v-if="data.expenses > 0")
                          .itemStat__graph__in._expense(:style="countWidthYear(data.expenses)")
        template(v-else)
          h3 Category is empty

    template(v-if="trnsList.length")
      .tabs
        .tabs-in
          a(@click.prevent="toogleShowAll()", :class="{_active: !showAll}") Months with data
          a(@click.prevent="toogleShowAll()", :class="{_active: showAll}") All months

      .module._bg
        .module-in
          .slideStat
            template(v-for="year of years")
              template(v-if="totalInYear(year).expenses > 0 || totalInYear(year).incomes > 0")
                .slideStat__item
                  h1.title._wide Year {{ year }}
                  .summaryShort._pb
                    .summaryShort__content
                      .summaryShort__item(v-if="total.incomes > 0 && total.expenses > 0")
                        .summaryShort__item__icon._expenses
                        .summaryShort__item__label Expenses
                        .summaryShort__item__total.expenses {{ formatMoney(totalInYear(year).expenses) }}

                      .summaryShort__item(v-if="total.incomes > 0 && total.expenses > 0")
                        .summaryShort__item__icon._incomes
                        .summaryShort__item__label Incomes
                        .summaryShort__item__total.incomes {{ formatMoney(totalInYear(year).incomes) }}

                      .summaryShort__item(v-if="total.incomes > 0 || total.expenses > 0")
                        .summaryShort__item__icon._total
                        .summaryShort__item__label Total
                        .summaryShort__item__total.sum {{ formatMoney(totalInYear(year).total) }}

                      .summaryShort__item
                        .summaryShort__item__icon._month
                        .summaryShort__item__label Month average
                        .summaryShort__item__total.sum {{ formatMoney(totalInYear(year).average) }}

                  .trns
                    template(v-for="data in dataInYear(year)")
                      .itemGraph(:class="{_opened: showedTrns.indexOf(data.month + year) !== -1, _noCursor: data.trns.length === 0}")
                        .itemGraph__in(@click.prevent.stop="data.trns.length > 0 ? toogleShowTrns(data.month, year) : null")
                          .itemGraph__content
                            .itemGraph__text
                              .itemGraph__name {{ data.month }}
                              .itemGraph__price.sum {{formatMoney(data.incomes - data.expenses)}}

                            template(v-if="data.incomes > 0 || data.expenses > 0")
                              .itemGraph__graph
                                template(v-if="data.incomes < data.expenses")
                                  .itemGraph__graph__in._expense(:style="countWidthMonth(data.expenses)")
                                  .itemGraph__graph__in._income(:style="countWidthMonth(data.incomes)")
                                template(v-else)
                                  .itemGraph__graph__in._income(:style="countWidthMonth(data.incomes)")
                                  .itemGraph__graph__in._expense(:style="countWidthMonth(data.expenses)")

                            template(v-else)
                              .itemGraph__graph: .itemGraph__graph__in

                        template(v-if="showedTrns.indexOf(data.month + year) !== -1")
                          .itemGraph__trns
                            TrnsList(:trns="data.trns", view="small")
  template(v-else)
    .module
      h1.title Category not found!
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  mounted() {
    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 27) { // escape key
        console.log('document.addEventListener: keyup')
        this.showedTrns = []
      }
    })
  },

  data() {
    return {
      showAll: false,
      showChild: true,
      showedTrns: []
    }
  },

  computed: {
    ...mapGetters(['trns']),

    categories() {
      return this.$store.state.categories.all
    },

    category() {
      if (this.$route.params.id) {
        // Different Id from bd and firebase
        const category = this.categories.find(a => a.id === this.$route.params.id)
        if (category) return category
        return false
      }
      return false
    },

    parentCategory() {
      if (this.category.parentId !== 0) {
        return this.categories.find(a => a.id === this.category.parentId)
      }
    },

    childCategories() {
      const categoryId = this.$route.params.id
      return this.categories.filter(c => c.parentId === categoryId)
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
    },

    trnsList() {
      const categoryId = this.$route.params.id

      if (this.showChild) {
        const childIds = this.categories
          .filter(c => c.parentId === categoryId)
          .map(c => c.id)

        return this.trns.filter(trn => {
          return trn.categoryId === categoryId || childIds.indexOf(trn.categoryId) !== -1
        })
      } else {
        return this.trns.filter(trn => trn.categoryId === categoryId)
      }
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
      const data = []

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
      })

      return data
    },

    dataByYears() {
      const data = []

      for (let year = 2017; year >= 2014; year--) {
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
            expenses: expensesTotal > 0 ? expensesTotal : 0,
            total: incomesTotal - expensesTotal
          })
        }
      }

      return data
    }
  },

  methods: {
    toogleShowAll() {
      this.showAll = !this.showAll
    },

    toogleShowTrns(month, year) {
      this.showedTrns.indexOf(month + year) === -1
        ? this.showedTrns.push(month + year)
        : this.showedTrns = this.showedTrns.filter(date => date !== month + year)
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
      const total = incomes - expenses

      const average = (year === 2017) ? total / 7 : total / 12

      return {
        expenses,
        incomes,
        total,
        average
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
            trns: trnsInMonth,
            incomes: incomesTotal > 0 ? incomesTotal : 0,
            expenses: expensesTotal > 0 ? expensesTotal : 0
          })
        } else {
          if (this.showAll) {
            data.push({
              month,
              trns: [],
              incomes: 0,
              expenses: 0
            })
          }
        }
      }

      return data
    }
  },

  components: { TrnsList }
}
</script>
