<template lang="pug">
div
  template(v-if="view === 'mobile'")
    .summaryShort._pb(:class="{_maxWidth: maxwidth}")
      .summaryShort__item._link(@click="$emit('changeTabMoney', 'expenses')")
        .summaryShort__item__icon._expenses
        .summaryShort__item__label Expenses
        .summaryShort__item__total.expenses {{ formatMoney(summary.expenses) }}

      .summaryShort__item._link(@click="$emit('changeTabMoney', 'incomes')")
        .summaryShort__item__icon._incomes
        .summaryShort__item__label Incomes
        .summaryShort__item__total.incomes {{ formatMoney(summary.incomes) }}

      .summaryShort__item._link(@click="$emit('changeTabMoney', 'history')")
        .summaryShort__item__icon._total
        .summaryShort__item__label Total
        .summaryShort__item__total.sum {{ formatMoney(summary.total) }}

      template(v-if="$store.state.dashboard.timePeriod === 'month'")
        .summaryShort__item
          .summaryShort__item__icon._average
          .summaryShort__item__label Average Total
          .summaryShort__item__total.sum {{ formatMoney(avSummary.total) }}

  //- dashboard-expenses
  template(v-if="view === 'dashboard-expenses'")
    .summaryShort._pbs
      .summaryShort__item._link(@click="$emit('toogleOpenedCategories')")
        .summaryShort__item__icon._expenses
        .summaryShort__item__label Actual
        .summaryShort__item__total.expenses {{ formatMoney(summary.expenses) }}

      template(v-if="$store.state.dashboard.timePeriod === 'month'")
        .summaryShort__item
          .summaryShort__item__icon._average
          .summaryShort__item__label Average
          .summaryShort__item__total.sum {{ formatMoney(avSummary.expenses) }}

      template(v-if="selectedCategory && $store.state.dashboard.timePeriod === 'month'")
        template(v-if="avSummary.leftToSpend > 0")
          .summaryShort__item
            .summaryShort__item__icon._spend
            .summaryShort__item__label Left to spend<br>before end of month
            .summaryShort__item__total.sum {{ formatMoney(avSummary.leftToSpend) }}

          .summaryShort__item
            .summaryShort__item__icon._day
            .summaryShort__item__label Could to spend in day
            .summaryShort__item__total.sum {{ formatMoney(avSummary.leftToSpendInDay) }}
        template(v-else)
          .summaryShort__item
            .summaryShort__item__icon._left
            .summaryShort__item__label Overspend
            .summaryShort__item__total.sum {{ formatMoney(avSummary.leftToSpend) }}

  //- dashboard-incomes
  template(v-if="view === 'dashboard-incomes'")
    .summaryShort._pbs
      .summaryShort__item
        .summaryShort__item__icon._incomes
        .summaryShort__item__label Actual
        .summaryShort__item__total.incomes {{ formatMoney(summary.incomes) }}
      template(v-if="$store.state.dashboard.timePeriod === 'month'")
        .summaryShort__item
          .summaryShort__item__icon._average
          .summaryShort__item__label Average
          .summaryShort__item__total.sum {{ formatMoney(avSummary.incomes) }}
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList'

export default {
  components: { TrnsList },
  mixins: [formatMoney],

  props: {
    trns: {
      type: Array,
      default: Array
    },
    view: {
      type: String
    },
    maxwidth: {
      type: Boolean
    },
    selectedCategory: {
      type: Object
    }
  },

  data() {
    return {
      monthsDurationDefault: 6
    }
  },

  computed: {
    ...mapGetters(['getTrns']),

    trnsList() {
      const startDate = moment().subtract(this.monthsDurationDefault, 'months').startOf('month')
      const endDate = moment().subtract(1, 'months').endOf('month')
      const categoryId = this.selectedCategory && this.selectedCategory.id
      return this.getTrns({ startDate, endDate, categoryId: categoryId })
    },

    summary() {
      if (this.trns.length) {
        const incomes = this.trns
          .filter(t => t.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const expenses = this.trns
          .filter(t => t.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const total = incomes - expenses

        return {
          incomes,
          expenses,
          total
        }
      } else {
        return {
          incomes: 0,
          expenses: 0,
          total: 0
        }
      }
    },

    avSummary() {
      if (this.trnsList.length) {
        const startDate = moment(this.trnsList[0].date).endOf('month')
        const endDate = moment(this.trnsList[this.trnsList.length - 1].date).startOf('month')
        const monthsDuration = startDate.diff(endDate, 'months') + 1
        const currentDay = moment().startOf('day')
        const endOfMonth = moment().endOf('month')
        const daysLeftInThisMonth = endOfMonth.diff(currentDay, 'days') + 1

        const incomes = this.trnsList
          .filter(t => t.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const expenses = this.trnsList
          .filter(t => t.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const total = incomes - expenses

        let devider = this.monthsDurationDefault
        // If count of months with data is less then monthsDurationDefault
        if (monthsDuration < this.monthsDurationDefault) devider = monthsDuration

        return {
          incomes: incomes / devider,
          expenses: expenses / devider,
          total: total / devider,
          leftToSpend: expenses / devider - this.summary.expenses,
          leftToSpendInDay: (expenses / devider - this.summary.expenses) / daysLeftInThisMonth
        }
      } else {
        return {
          incomes: 0,
          expenses: 0,
          total: 0
        }
      }
    }
  }
}
</script>
