<template lang="pug">
.content
  .module
    h1.title
      .icon(:class="`icon-${category.id}`"): .icon__pic
      .name {{ category.name }}
      .sup  {{ category.id }}

    .countWithChildren
      label.checkbox
        input.checkbox__input(type="checkbox" v-model="showChildren")
        h1.checkbox__name Count with children categories
      div(v-for="category in childrenCategories")
        div {{ category.name }}

    .categoryStat
      .categoryStat__trns._long
        h2.ml Years
        template(v-for="data of dataByYears")
          .itemStat._mb
            .itemStat__content
              .itemStat__text
                .itemStat__name {{ data.year }}
                .itemStat__price.incomes(v-if="data.incomes > 0")
                  div {{formatMoney(data.incomes)}}
                .itemStat__price.expenses
                  div {{formatMoney(data.expenses)}}
                .itemStat__price.sum
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

  .tabs
    a(@click.prevent="toogleShowAll()", :class="{_active: !showAll}") Months with data
    a(@click.prevent="toogleShowAll()", :class="{_active: showAll}") All months

  .module._bg
    .module__in
      template(v-for="year of years")
        template(v-if="totalInYear(year).expenses > 0 || totalInYear(year).incomes > 0")
          .module__cell
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
                  .summaryShort__item__total.sum {{ formatMoney(totalInYear(year).incomes - totalInYear(year).expenses) }}

                .summaryShort__item
                  .summaryShort__item__icon._month
                  .summaryShort__item__label Month average
                  template(v-if="year === 2017")
                    .summaryShort__item__total.sum {{ formatMoney((totalInYear(year).incomes - totalInYear(year).expenses) / 5) }}
                  template(v-else)
                    .summaryShort__item__total.sum {{ formatMoney((totalInYear(year).incomes - totalInYear(year).expenses) / 12) }}

            .trns
              h1(@click.prevent="showTrns(year)")._pl {{ year }}
              template(v-for="data in dataInYear(year)")
                .itemStat._mbs._link(@click.prevent.stop="showTrns(year, data.month)")
                  .itemStat__content
                    .itemStat__text
                      .itemStat__name {{ data.month }}
                      .itemStat__price
                        .incomes
                          template(v-if="data.incomes > 0") {{formatMoney(data.incomes)}}
                      .itemStat__price
                        .expenses
                          template(v-if="data.expenses > 0") {{formatMoney(data.expenses)}}

                    template(v-if="data.incomes > 0 || data.expenses > 0")
                      .itemStat__graph
                        template(v-if="data.incomes > 0")
                          .itemStat__graph__in._income(:style="countWidthMonth(data.incomes)")
                        template(v-if="data.expenses > 0")
                          .itemStat__graph__in._expense(:style="countWidthMonth(data.expenses)")
                    template(v-else)
                      .itemStat__graph: .itemStat__graph__in

  //- .module

  .module(v-if="selectedTrnList.length > 0")
    h1.title._wide._trns Trns history
    h2.title {{ selectedDateName }}
    div(style="padding-left: 15px")
      TrnsList(:trns="selectedTrnList")
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  data() {
    return {
      showAll: false,
      showChildren: false,
      selectedTrnList: [],
      selectedDateName: ''
    }
  },

  computed: {
    ...mapGetters(['categories', 'trns']),

    category() {
      const categoryId = +this.$route.params.id
      return this.categories.find(a => a.id === categoryId)
    },

    childrenCategories() {
      const categoryId = +this.$route.params.id
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
      const categoryId = +this.$route.params.id

      if (this.showChildren) {
        const childrenIds = this.categories
          .filter(c => c.parentId === categoryId)
          .map(c => c.id)

        return this.trns.filter(trn => {
          return trn.categoryId === categoryId || childrenIds.indexOf(trn.categoryId) !== -1
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
              incomes: incomesTotal > 0 ? incomesTotal : 0,
              expenses: expensesTotal > 0 ? expensesTotal : 0
            }]
          } else {
            data = [...data, {
              month,
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
            expenses: expensesTotal > 0 ? expensesTotal : 0
          })
        }
      }

      return data
    }
  },

  methods: {
    showTrns(year, month) {
      if (month) {
        // Trns for one month
        const fromDate = moment(`${month}.${year}`, 'MMMM.Y').valueOf()
        const toDate = moment(fromDate).endOf('month').valueOf()
        this.selectedTrnList = this.trnsList.filter(t => t.date >= fromDate && t.date <= toDate)
        this.selectedDateName = `${month} ${year}`
      } else {
        // Trns for one year
        const fromDate = moment(year, 'Y').valueOf()
        const toDate = moment(fromDate).endOf('year').valueOf()
        this.selectedTrnList = this.trnsList.filter(t => t.date >= fromDate && t.date <= toDate)
        this.selectedDateName = `Year ${year}`
      }

      setTimeout(() => {
        this.$scrollTo('._trns', 400, { easing: 'ease-in-out' })
      }, 10)
    },

    toogleShowAll() {
      this.showAll = !this.showAll
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
          if (this.showAll) {
            data.push({
              month,
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
