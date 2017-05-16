<template lang="pug">
.content
  .module
    h1.title
      | Summary:&nbsp;
      .dropdown
        .dropdown__name
          template(v-if="duration === 1") Today
          template(v-else) {{ duration }} days
        .dropdown__content(:class="{_visible: showDropdown}")
          template(v-for="day of days")
            a.dropdown__link(@click.prevent="setDuration(day)", :class="{_active: duration === day}") {{ day }}

    .table
      .table__cell
        h2 This days
        .summaryShort._limitWidth
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

      .table__cell
        h2 Prev {{ duration }} days
        .summaryShort._limitWidth
          .summaryShort__content
            template(v-if="total.expenses > 0 || total.incomes > 0")
              .summaryItem(v-if="total.incomes > 0")
                .summaryItem__icon._incomes
                .summaryItem__label Incomes
                .summaryItem__total.income {{ formatMoney(total.prevIncomes) }}
              .summaryItem(v-if="total.expenses > 0")
                .summaryItem__icon._expenses
                .summaryItem__label Expenses
                .summaryItem__total.expense {{ formatMoney(total.prevExpenses) }}
              .summaryItem
                .summaryItem__icon._total
                .summaryItem__label Total
                .summaryItem__total.sum {{ formatMoney(total.prevIncomes - total.prevExpenses) }}



  .tabs
    a(@click="changeTab('summary')", :class="{_active: showedTab === 'summary'}") Summary
    a(@click="changeTab('trns')", :class="{_active: showedTab === 'trns'}") Trns

  .module._bg(v-show="showedTab === 'summary'")
    .table
      .table__cell
        h1.title.expense._wide Expenses
        .trns
          template(v-for="category in expensesData")
            router-link.itemStat(
              :to="`/trns/${category.id}`",
              title="Показать транзакции"
            )
              router-link.itemStat__icon(
                :to="`/categories/${category.id}`",
                title="Перейти в категорию"
              )
                .icon(:class="`icon-${category.id}`"): .icon__pic
              .itemStat__content
                .itemStat__text
                  .itemStat__name {{ category.name }}
                  .itemStat__price._prev(v-if="getPrevData(category.id, category.total) > 0") {{ formatMoney(getPrevData(category.id, category.total)) }}
                  .itemStat__price {{ formatMoney(category.total) }}
                .itemStat__graph
                  .itemStat__graph__in._expense(:style="countWidth(category.total, geCategoryData(expensesTrns))")

      .table__cell
        template(v-if="incomesData.length > 0")
          h1.title.income._wide Incomes
          .trns
            template(v-for="category in incomesData")
              router-link.itemStat(
                :to="`/categories/${category.id}`",
                title="Перейти в категорию"
              )
                .itemStat__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ category.name }}
                    .itemStat__price._prev(v-if="getPrevData(category.id, category.total) > 0") {{ formatMoney(getPrevData(category.id, category.total)) }}
                    .itemStat__price {{ formatMoney(category.total) }}
                  .itemStat__graph
                    .itemStat__graph__in._income(:style="countWidth(category.total, geCategoryData(incomesTrns))")

  .module._bg(v-show="showedTab === 'trns'")
    h1.title._wide._trns Trns history
    TrnsList(:trns="trnsList.slice(0, 50)")
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
import SummaryShort from './SummaryShort.vue'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  data() {
    return {
      showedTab: 'summary',
      showDropdown: false,
      editTrnId: null,
      days: [1, 3, 5, 10, 15, 30, 99999999]
    }
  },

  computed: {
    ...mapGetters(['categories', 'trns']),

    duration() {
      return this.$store.state.filter.duration
    },

    fromDate() {
      return moment().subtract(this.duration - 1, 'days').startOf('day').valueOf()
    },

    toDate() {
      return moment().endOf('day').valueOf()
    },

    trnsList() {
      return this.trns
        .filter(trn =>
          trn.categoryId !== 62 && // disable category 'Перевод'
          moment(trn.date) >= this.fromDate &&
          moment(trn.date) <= this.toDate
      )
    },

    total() {
      const incomes = this.trnsList
        .filter(t => t.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0)

      const expenses = this.trnsList
        .filter(t => t.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0)

      const fromDate = moment(this.fromDate).subtract(this.duration, 'days').startOf('day').valueOf()
      const toDate = moment(this.fromDate).subtract(1, 'days').endOf('day').valueOf()
      const prevTrns = this.trns
        .filter(t =>
          t.categoryId !== 62 &&
          moment(t.date) >= fromDate &&
          moment(t.date) <= toDate)

      const prevIncomes = prevTrns
        .filter(t => t.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0)

      const prevExpenses = prevTrns
        .filter(t => t.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0)

      return {
        incomes,
        expenses,
        prevIncomes,
        prevExpenses
      }
    },

    expensesTrns() {
      return this.trnsList.filter(trn => trn.type === 0)
    },

    expensesData() {
      return this.geCategoryData(this.expensesTrns)
    },

    expensesTotal() {
      return this.getTotal(this.expensesTrns)
    },

    incomesTrns() {
      return this.trnsList.filter(trn => trn.type === 1)
    },

    incomesData() {
      return this.geCategoryData(this.incomesTrns)
    },

    incomesTotal() {
      return this.getTotal(this.incomesTrns)
    }
  },

  methods: {
    changeTab(tab) {
      this.showedTab = tab
    },

    getTotal(trns) {
      if (trns.length > 0) {
        return trns.reduce((sum, current) => sum + current.amountRub, 0)
      }
      return 0
    },

    geCategoryData(trns) {
      if (trns && trns.length > 0) {
        // Create array of categories ids
        const catsIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)

        // Create array of objects with categories data
        const data = catsIds.map((id) => {
          const total = trns
            .filter(trn => trn.categoryId === id)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const name = this.categories.find(c => c.id === id).name
          return { id, name, total }
        })

        const dataSorted = orderBy(data, d => d.total, 'desc')
        return dataSorted
      }

      return false
    },

    getPrevData(categoryId, prevTotal) {
      const fromDate = moment(this.fromDate).subtract(this.duration, 'days').startOf('day').valueOf()
      const toDate = moment(this.fromDate).subtract(1, 'days').endOf('day').valueOf()
      const trns = this.trns
        .filter(t =>
          t.categoryId !== 62 &&
          moment(t.date) >= fromDate &&
          moment(t.date) <= toDate &&
          t.categoryId === categoryId)
      const total = trns.reduce((sum, current) => sum + current.amountRub, 0)

      if (total > 0) return total
      return false
    },

    countWidth(total, trns) {
      const width = total / trns[0].total * 100
      const renderWidth = width > 0 ? width : 0
      return { width: `calc(${renderWidth}%)` }
    },

    setDuration(duration) {
      this.showDropdown = false
      this.$store.commit('setDuration', duration)
    }
  },

  components: { SummaryShort, TrnsList }
}
</script>
