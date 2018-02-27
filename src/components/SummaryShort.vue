<template lang="pug">
.summary
  //- itemStat
  template(v-if="view === 'itemStat'")
      template
        .summaryShort._itemStat
          .flex
            template(v-if="selectedCategory && selectedCategory.showStat")
              template(v-if="avSummary.leftToSpend > 0")
                .summaryShort__item._Change(
                  v-tooltip.bottom-center="{ content: 'This showed you how much you can spend before end of month. <br />Based on ' + monthsDurationReal + ' months.' }"
                )
                  .summaryShort__item__icon._small
                    .mdi.mdi-av-timer
                  //- .summaryShort__item__label Could to spend in day
                  .summaryShort__item__total._grey.sum {{ formatMoney(avSummary.leftToSpendInDay) }}

                .summaryShort__item._Change
                  .summaryShort__item__icon._small
                    .mdi.mdi-timetable
                  //- .summaryShort__item__label Left to spend<br>before end of month
                  .summaryShort__item__total._grey.sum {{ formatMoney(avSummary.leftToSpend) }}
              template(v-else)
                .summaryShort__item._Change
                  .summaryShort__item__icon._small
                    .mdi.mdi-database-minus
                  //- .summaryShort__item__label Overspend
                  .summaryShort__item__total.sum {{ formatMoney(avSummary.leftToSpend) }}

            .summaryShort__item._Change
              .summaryShort__item__icon._small
                .mdi.mdi-chart-timeline
              //- .summaryShort__item__label Average
              .summaryShort__item__total._grey.sum {{ formatMoney(avSummary.expenses) }}

  //- Mobile new
  template(v-if="view === 'mobile-incomes'")
    .moneyBlock._mb(@click="$store.dispatch('setMobileDashboardActiveTab', 'incomes')")
      .moneyBlock__line2
        .moneyTitle.incomes Incomes
        .moneyBlock__total.incomes {{ formatMoney(summary.incomes) }}
      template(v-if="avSummary.incomes !== 0")
        .moneyBlock__line2
          .moneyBlock__title
            .mdi.mdi-chart-timeline
            div Average
          .moneyBlock__average: .sum {{ formatMoney(avSummary.incomes) }}

  template(v-if="view === 'mobile-expenses'")
    .moneyBlock._mb(@click="$store.dispatch('setMobileDashboardActiveTab', 'expenses')")
      .moneyBlock__line2
        .moneyTitle.expenses Expenses
        .moneyBlock__total.expenses {{ formatMoney(summary.expenses) }}
      template(v-if="avSummary.expenses !== 0")
        .moneyBlock__line2
          .moneyBlock__title
            .mdi.mdi-chart-timeline
            div Average
          .moneyBlock__average: .sum {{ formatMoney(avSummary.expenses) }}

  template(v-if="view === 'mobile-new'")
    .moneyBlock._mb(@click="$store.dispatch('setMobileDashboardActiveTab', 'expenses')")
      .moneyBlock__line2
        .moneyTitle.expenses Expenses
        .moneyBlock__total.expenses {{ formatMoney(summary.expenses) }}
      template(v-if="avSummary.expenses !== 0")
        .moneyBlock__line2
          .moneyBlock__title
            .mdi.mdi-chart-timeline
            div Average
          .moneyBlock__average: .sum {{ formatMoney(avSummary.expenses) }}

    .moneyBlock._mb(@click="$store.dispatch('setMobileDashboardActiveTab', 'incomes')")
      .moneyBlock__line2
        .moneyTitle.incomes Incomes
        .moneyBlock__total.incomes {{ formatMoney(summary.incomes) }}
      template(v-if="avSummary.incomes !== 0")
        .moneyBlock__line2
          .moneyBlock__title
            .mdi.mdi-chart-timeline
            div Average
          .moneyBlock__average: .sum {{ formatMoney(avSummary.incomes) }}

    .moneyBlock._mb(@click="$store.dispatch('setMobileDashboardActiveTab', 'history')")
      .moneyBlock__line2
        .moneyTitle
          template(v-if="summary.sum > 0") Saved
          template(v-else-if="summary.sum < 0") Spent
          template(v-else) Total
        .moneyBlock__total.sum {{ formatMoney(summary.sum) }}
      template(v-if="avSummary.sum !== 0")
        .moneyBlock__line2
          .moneyBlock__title
            .mdi.mdi-chart-timeline
            div Average
          .moneyBlock__average: .sum {{ formatMoney(avSummary.sum) }}

  //- Dashboard full
  template(v-if="view === 'dashboard-full'")
    .flex
      .moneyBlock._noMargin
        .moneyBlock__line
          .moneyTitle.expenses Expenses
          .moneyBlock__total.expenses {{ formatMoney(summary.expenses) }}

        template(v-if="avSummary.expenses !== 0")
          .moneyBlock__line
            .moneyBlock__title
              .mdi.mdi-chart-timeline
              div Average
            .moneyBlock__average: .sum {{ formatMoney(avSummary.expenses) }}

      .moneyBlockSep

      .moneyBlock._noMargin
        .moneyBlock__line
          .moneyTitle
            template(v-if="summary.sum > 0") Saved
            template(v-else-if="summary.sum < 0") Spent
            template(v-else) Total
          .moneyBlock__total.sum {{ formatMoney(summary.sum) }}

        template(v-if="avSummary.sum !== 0")
          .moneyBlock__line
            .moneyBlock__title
              .mdi.mdi-chart-timeline
              div Average
            .moneyBlock__average: .sum {{ formatMoney(avSummary.sum) }}

      .moneyBlockSep

      .moneyBlock._noMargin
        .moneyBlock__line
          .moneyTitle.incomes Incomes
          .moneyBlock__total.incomes {{ formatMoney(summary.incomes) }}
        template(v-if="avSummary.incomes !== 0")
          .moneyBlock__line
            .moneyBlock__title
              .mdi.mdi-chart-timeline
              div Average
            .moneyBlock__average: .sum {{ formatMoney(avSummary.incomes) }}


  //- Dashboard expenses
  template(v-if="view === 'dashboard-expenses'")
    template(v-if="!this.getFilter.category")
      .moneyBlock
        .moneyBlock__line
          .moneyTitle.expenses Expenses
          .moneyBlock__total.expense(@click="$emit('toogleOpenedCategories')") {{ formatMoney(summary.expenses) }}

        .moneyBlock__line
          template(v-if="avSummary.expenses !== 0")
            .moneyBlock__title._average
              .mdi.mdi-chart-timeline
              div Average
            .moneyBlock__average: .sum {{ formatMoney(avSummary.expenses) }}


  //- Dashboard incomes
  template(v-if="view === 'dashboard-incomes'")
    template(v-if="!this.getFilter.category")

      .moneyBlock
        .moneyBlock__line
          .moneyTitle.incomes Incomes
          .moneyBlock__total.incomes(@click="$emit('toogleOpenedCategories')") {{ formatMoney(summary.incomes) }}

        .moneyBlock__line
          template(v-if="avSummary.incomes !== 0")
            .moneyBlock__title._average
              .mdi.mdi-chart-timeline
              div Average
            .moneyBlock__average: .sum {{ formatMoney(avSummary.incomes) }}
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
    type: {
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
      monthsDurationDefault: 12,
      monthsDurationReal: 0
    }
  },

  computed: {
    ...mapGetters(['getTrns', 'getFilter', 'mobileDashboardActiveTab']),

    $timePeriod() {
      return this.$store.state.dashboard.timePeriod
    },

    trnsList() {
      const startDate = moment().subtract(this.monthsDurationDefault, this.$timePeriod).startOf(this.$timePeriod)
      const endDate = moment().subtract(1, this.$timePeriod).endOf(this.$timePeriod)
      let categoryId = this.getFilter.category && this.getFilter.category.id
      const accountId = this.getFilter.account && this.getFilter.account.id
      if (this.selectedCategory) {
        categoryId = this.selectedCategory.id
      }
      return this.getTrns({ startDate, endDate, accountId, categoryId })
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
        const sum = incomes - expenses

        return {
          incomes,
          expenses,
          total,
          sum
        }
      } else {
        return {
          incomes: 0,
          expenses: 0,
          total: 0,
          sum: 0
        }
      }
    },

    avSummary() {
      if (this.trnsList.length) {
        const startDate = moment(this.trnsList[0].date).endOf(this.$timePeriod)
        const endDate = moment(this.trnsList[this.trnsList.length - 1].date).startOf(this.$timePeriod)
        const monthsDuration = startDate.diff(endDate, this.$timePeriod) + 1
        const currentDay = moment().startOf('day')
        const endOfMonth = moment().endOf(this.$timePeriod)
        const daysLeftInThisMonth = endOfMonth.diff(currentDay, 'days') + 1
        this.monthsDurationReal = monthsDuration

        const incomes = this.trnsList
          .filter(t => t.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const expenses = this.trnsList
          .filter(t => t.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)
        const total = incomes - expenses
        const sum = incomes - expenses

        let devider = this.monthsDurationDefault
        // If count of months with data is less then monthsDurationDefault
        if (monthsDuration < this.monthsDurationDefault) devider = monthsDuration

        return {
          incomes: incomes / devider,
          expenses: expenses / devider,
          total: total / devider,
          sum: sum / devider,
          leftToSpend: expenses / devider - this.summary.expenses,
          leftToSpendInDay: (expenses / devider - this.summary.expenses) / daysLeftInThisMonth
        }
      } else {
        return {
          incomes: 0,
          expenses: 0,
          total: 0,
          sum: 0
        }
      }
    }
  }
}
</script>
