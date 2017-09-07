<template lang="pug">
div
  template(v-if="trns.length")
    //- dashboard-summary
    template(v-if="view === 'dashboard-summary'")
      template(v-if="duration > 14")
        h3.title._mbs Week Average
        .summaryShort._pb(:class="{_maxWidth: maxwidth}")
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.incomes / 7) }}
          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.expenses / 7) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.total / 7) }}

      template(v-if="duration > 60")
        h3.title._mbs Month Average
        .summaryShort._pb(:class="{_maxWidth: maxwidth}")
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.incomes / 30) }}
          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.expenses / 30) }}
          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.total / 30) }}

    //- dashboard-average
    template(v-if="view === 'dashboard-average'")
      h3.title._mbs
        | Average&nbsp;
        sup.sup {{ avDays }} days
      .summaryShort(:class="{_maxWidth: maxwidth}")
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
      .summaryShort._pbs(:class="{_maxWidth: maxwidth}")
        .summaryShort__item
          .summaryShort__item__icon._expenses
          .summaryShort__item__label Expenses
          .summaryShort__item__total.expenses {{ formatMoney(summary.expenses) }}

    //- dashboard-incomes
    template(v-if="view === 'dashboard-incomes'")
      .summaryShort._pbs(:class="{_maxWidth: maxwidth}")
        .summaryShort__item
          .summaryShort__item__icon._incomes
          .summaryShort__item__label Incomes
          .summaryShort__item__total.incomes {{ formatMoney(summary.incomes) }}

    //- Day
    template(v-if="view === 'day'")
      template(v-if="duration > 1")
        h3.title._mbs Day Average
        .summaryShort(:class="{_maxWidth: maxwidth}")
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.incomes / duration) }}
          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.expenses / duration) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.total / duration) }}

    //- Week
    template(v-if="view === 'week'")
      template(v-if="duration > 14")
        h3.title._mbs Week Average
        .summaryShort(:class="{_maxWidth: maxwidth}")
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.incomes / 7) }}
          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.expenses / 7) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.total / 7) }}

    //- Month
    template(v-if="view === 'month'")
      template(v-if="duration > 60")
        h3.title._mbs Month Average
        .summaryShort(:class="{_maxWidth: maxwidth}")
          .summaryShort__item
            .summaryShort__item__icon._incomes
            .summaryShort__item__label Incomes
            .summaryShort__item__total.incomes {{ formatMoney(summary.incomes / 30) }}
          .summaryShort__item
            .summaryShort__item__icon._expenses
            .summaryShort__item__label Expenses
            .summaryShort__item__total.expenses {{ formatMoney(summary.expenses / 30) }}

          .summaryShort__item
            .summaryShort__item__icon._total
            .summaryShort__item__label Total
            .summaryShort__item__total.sum {{ formatMoney(summary.total / 30) }}
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
    },
    maxwidth: {
      type: Boolean
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
      const startDate = moment().subtract(6, 'months')
      const endDate = moment()
      const yearTrns = this.getTrns({ startDate, endDate })

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
