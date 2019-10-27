<script>
import Amount from '@/components/amount/Amount'
import BudgetForm from '@/components/budgets/BudgetForm'
import BudgetItem from '@/components/budgets/BudgetItem'
import Button from '@/components/shared/button/Button'
import ComponentWrap from '@/components/layout/component/Component'

export default {
  components: {
    Amount,
    BudgetForm,
    BudgetItem,
    Button,
    ComponentWrap
  },

  data () {
    return {
      isShowForm: false
    }
  },

  computed: {
    budgets () {
      return this.$store.getters.budgets
    },

    budgetsCount () {
      return Object.keys(this.$store.getters.budgets).length
    },

    styles () {
      return {
        width: '60%'
        // width: `${Math.abs(this.gotAmount) / Math.abs(this.budget.amount) * 100}%`
      }
    }
  },

  async created () {
    await this.$store.dispatch('initBudgets')
  }
}
</script>

<template lang="pug">
ComponentWrap
  template(slot="headerLeft") {{ $lang.budgets.name }}

  template(slot="contentLeft" v-if="$store.getters.budgetsTotal")
    .budgetItem._total
      .budgetItem__top
        .budgetItem__meta
          .budgetItem__name Total budgets {{ $store.getters.budgetsTotal.count }}

        .budgetItem__total
          .sum._right
            .sum__title {{ $lang.budgets.stat.total }}
            .sum__amount
              Amount(
                :currency="$store.state.currencies.base"
                :value="$store.getters.budgetsTotal.total")

      .budgetItem__info
        .budgetItem__amounts
          .sum
            .sum__title {{ $lang.budgets.stat.left }}
            .sum__amount
              Amount(
                :currency="$store.state.currencies.base"
                :value="$store.getters.budgetsTotal.total - $store.getters.budgetsTotal.incomes")

          .sum._right
            .sum__title {{ $lang.budgets.stat.got }}
            .sum__amount
              Amount(
                :currency="$store.state.currencies.base"
                :type="1"
                :value="$store.getters.budgetsTotal.incomes")

        .budgetItem__graph: .budgetItem__graph__in(:style="styles")

    template(v-if="budgetsCount")
      .list
        BudgetItem(
          v-for="(budget, budgetId) in budgets"
          :budget="budget"
          :id="budgetId"
          :key="budgetId")
    template(v-else)
      h1 No budgets

  template(slot="contentRight")
    BudgetForm
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables"

.list
  display grid
  grid-template-columns repeat(auto-fill, minmax(auto, 1fr))
  grid-column-gap 12px
  grid-row-gap 12px

  +media-laptop()
    grid-column-gap 16px
    grid-row-gap 16px
</style>
