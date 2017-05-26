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
    //- title


    .table
      .table__cell(v-if="summary.expenses > 0 || summary.incomes > 0")
        h2 This days
        .summaryShort
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.incomes) }}

          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.expenses) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.total) }}
        //- summaryShort
      //- table__cell


      .table__cell(v-if="summary.prevExpenses > 0 || summary.prevIncomes > 0")
        h2 Prev {{ duration }} days
        .summaryShort
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.prevIncomes) }}

          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.prevExpenses) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.prevTotal) }}
        //- summaryShort
      //- table__cell
    //- table
  //- module

  template(v-if="(summary.expenses || summary.incomes) > 0")
    .tabs
      a(@click="changeTab('summary')", :class="{_active: showedTab === 'summary'}") Summary
      a(@click="changeTab('trns')", :class="{_active: showedTab === 'trns'}") Trns


    .module._bg(v-show="showedTab === 'summary'")
      .table
        .table__cell(v-if="expensesCategories.length > 0")
          h1.title.expenses._wide Expenses
          .trns
            template(v-for="category in expensesCategories")
              router-link.itemStat(
              :to="`/categories/${category.id}`",
              title="Перейти в категорию")
                .itemStat__icon: .icon(:class="`icon-${category.parentId} icon-${category.id}`"): .icon__pic
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ category.name }}
                    .itemStat__price._prev(v-if="getPrevData(category.id, category.total) > 0") {{ formatMoney(getPrevData(category.id, category.total)) }}
                    .itemStat__price {{ formatMoney(category.total) }}
                  .itemStat__graph
                    .itemStat__graph__in._expense(:style="countWidth(category.total, expensesCategories)")
            //- trns
        //- table__cell


        .table__cell(v-if="incomesCategories.length > 0")
          h1.title.incomes._wide Incomes
          .trns
            template(v-for="category in incomesCategories")
              router-link.itemStat(
                :to="`/categories/${category.id}`",
                title="Перейти в категорию")
                .itemStat__icon: .icon(:class="`icon-${category.id}`"): .icon__pic
                .itemStat__content
                  .itemStat__text
                    .itemStat__name {{ category.name }}
                    .itemStat__price._prev(v-if="getPrevData(category.id, category.total) > 0") {{ formatMoney(getPrevData(category.id, category.total)) }}
                    .itemStat__price {{ formatMoney(category.total) }}
                  .itemStat__graph
                    .itemStat__graph__in._income(:style="countWidth(category.total, incomesCategories)")
            //- trns
        //- table__cell
      //- table
    //- module._bg


    .module._bg(v-show="showedTab === 'trns'")
      h1.title._wide._trns Trns history
      TrnsList(:trns="trnsList.slice(0, 50)")
    //- module._bg


  template(v-else)
    .module._bg
      h4 No trnasactions for this days.
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import uniqBy from 'lodash/uniqBy'
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'
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

    date() {
      return {
        from: moment().subtract(this.duration - 1, 'days').startOf('day').valueOf(),
        to: moment().endOf('day').valueOf()
      }
    },

    trnsList() {
      return this.trns
        .filter(trn =>
          trn.categoryId !== 62 && // disable category 'Перевод'
          moment(trn.date) >= this.date.from &&
          moment(trn.date) <= this.date.to
      )
    },

    summary() {
      const incomes = this.trnsList
        .filter(t => t.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0)
      const expenses = this.trnsList
        .filter(t => t.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0)
      const total = incomes - expenses

      const fromDate = moment(this.date.from).subtract(this.duration, 'days').startOf('day').valueOf()
      const toDate = moment(this.date.from).subtract(1, 'days').endOf('day').valueOf()
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
      const prevTotal = prevIncomes - prevExpenses

      return {
        incomes,
        expenses,
        total,
        prevIncomes,
        prevExpenses,
        prevTotal
      }
    },

    expensesCategories() {
      return this.geCategoryData('expenses')
    },

    incomesCategories() {
      return this.geCategoryData('incomes')
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

    geCategoryData(type) {
      let trns = []
      if (type === 'incomes') trns = this.trnsList.filter(trn => trn.type === 1)
      if (type === 'expenses') trns = this.trnsList.filter(trn => trn.type === 0)

      if (trns.length > 0) {
        // Create array of categories ids
        const catsIds = uniqBy(trns, 'categoryId').map(trn => trn.categoryId)

        // Create array of objects with categories data
        const data = catsIds.map((id) => {
          const total = trns
            .filter(trn => trn.categoryId === id)
            .reduce((sum, current) => sum + current.amountRub, 0)
          const category = this.categories.find(c => c.id === id)
          return {
            id,
            parentId: category.parentId,
            name: category.name,
            total
          }
        })

        const dataSorted = orderBy(data, d => d.total, 'desc')
        return dataSorted
      }
      return false
    },

    getPrevData(categoryId, prevTotal) {
      const fromDate = moment(this.date.from).subtract(this.duration, 'days').startOf('day').valueOf()
      const toDate = moment(this.date.from).subtract(1, 'days').endOf('day').valueOf()
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

  components: { TrnsList }
}
</script>
