<script>
export default {
  data () {
    return {
      isShowForm: false
    }
  },

  computed: {
    budgets () {
      return this.$store.getters['budgets/budgets']
    },

    budgetsCount () {
      return Object.keys(this.$store.getters['budgets/budgets']).length
    }
  },

  async created () {
    await this.$store.dispatch('budgets/initBudgets')
  }
}
</script>

<template lang="pug">
LayoutComponentWrap
  template(slot="headerLeft") {{ $t('budgets.name') }}

  template(slot="contentLeft" v-if="$store.getters['budgets/budgetsTotal']")
    .budgetItem._total
      .budgetItem__top
        .budgetItem__meta
          .budgetItem__name Total budgets {{ $store.getters['budgets/budgetsTotal'].count }}

        .budgetItem__total
          .sum._right
            .sum__title {{ $t('budgets.stat.total') }}
            .sum__amount
              Amount(
                :currency="$store.state.currencies.base"
                :value="$store.getters['budgets/budgetsTotal'].total")

      .budgetItem__info
        .budgetItem__amounts
          .sum
            .sum__title {{ $t('budgets.stat.left') }}
            .sum__amount
              Amount(
                :currency="$store.state.currencies.base"
                :value="$store.getters['budgets/budgetsTotal'].total - $store.getters['budgets/budgetsTotal'].incomes")

          .sum._right
            .sum__title {{ $t('budgets.stat.got') }}
            .sum__amount
              Amount(
                :currency="$store.state.currencies.base"
                :type="1"
                :value="$store.getters['budgets/budgetsTotal'].incomes")

        .budgetItem__graph: .budgetItem__graph__in

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
@import "~assets/stylus/variables"

.list
  display grid
  grid-template-columns repeat(auto-fill, minmax(auto, 1fr))
  grid-column-gap 12px
  grid-row-gap 12px

  +media-laptop()
    grid-column-gap 16px
    grid-row-gap 16px
</style>
