<template lang="pug">
div
  //- dashboard-summary
  template(v-if="view === 'dashboard-summary'")
    h3.title._mbs Summary
    .summaryShort._pb
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

  //- dashboard-average
  template(v-if="view === 'dashboard-average'")
    h3.title._mbs
      | Average&nbsp;
      sup.sup {{ avDays }} days
    .summaryShort
      .summaryShort__item
        .summaryShort__item__icon._incomes
        .summaryShort__item__label Incomes
        .summaryShort__item__total.incomes {{ formatMoney(avSummary.incomes) }}
      .summaryShort__item
        .summaryShort__item__icon._expenses
        .summaryShort__item__label Expenses
        .summaryShort__item__total.expenses {{ formatMoney(avSummary.expenses) }}
      .summaryShort__item
        .summaryShort__item__icon._total
        .summaryShort__item__label Total
        .summaryShort__item__total.sum {{ formatMoney(avSummary.total) }}

  //- dashboard-expenses
  template(v-if="view === 'dashboard-expenses'")
    .summaryShort._pbs
      .summaryShort__item
        .summaryShort__item__icon._expenses
        .summaryShort__item__label Expenses
        .summaryShort__item__total.expenses {{ formatMoney(summary.expenses) }}
      .summaryShort__item(v-if="duration > 1")
        .summaryShort__item__icon._month
        .summaryShort__item__label Day average
        .summaryShort__item__total.sum {{ formatMoney(summary.expenses / duration) }}

  //- dashboard-incomes
  template(v-if="view === 'dashboard-incomes'")
    .summaryShort._pbs
      .summaryShort__item
        .summaryShort__item__icon._incomes
        .summaryShort__item__label Incomes
        .summaryShort__item__total.incomes {{ formatMoney(summary.incomes) }}
      .summaryShort__item(v-if="duration > 1")
        .summaryShort__item__icon._month
        .summaryShort__item__label Day average
        .summaryShort__item__total.sum {{ formatMoney(summary.incomes / duration) }}
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  props: {
    title: {
      type: String
    },
    trns: {
      type: Array,
      default: Array
    },
    view: {
      type: String
    }
  },

  data() {
    return {
      avDays: 180
    }
  },

  computed: {
    ...mapGetters(['getTrns']),

    duration() {
      return this.$store.state.filter.duration
    },

    summary() {
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
    },

    avSummary() {
      const yearTrns = this.getTrns(moment().subtract(6, 'months'), moment())
      const avStartDate = moment(yearTrns[0].date)
      const avEndDate = moment(yearTrns[yearTrns.length - 1].date)
      this.avDays = avStartDate.diff(avEndDate, 'days') + 1

      const avIncomes = yearTrns
        .filter(t => t.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0) / this.avDays * this.duration
      const avExpenses = yearTrns
        .filter(t => t.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0) / this.avDays * this.duration
      const total = avIncomes - avExpenses

      return {
        incomes: avIncomes,
        expenses: avExpenses,
        total
      }
    }
  }
}
</script>
