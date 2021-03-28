<script>
export default {
  name: 'DashboardStatControl',

  computed: {
    isEmptyData () {
      const statCurrentPeriod = this.$store.getters['stat/statCurrentPeriod']
      if (statCurrentPeriod.incomes.categoriesIds.length === 0 &&
          statCurrentPeriod.expenses.categoriesIds.length === 0 &&
          this.$store.getters['trns/selectedTrnsIdsWithDate'].length === 0) {
        return true
      }
      return false
    }
  }
}
</script>

<template lang="pug">
.component
  .component__wrap
    .tabs
      .tabItem(
        @click="$store.commit('dashboard/setDashboardActiveTab', 'stat')"
        :class="{ _active: $store.state.dashboard.activeTab === 'stat' }"
      ) {{ $t('stat.shortTitle') }}

      .tabItem(
        @click="$store.commit('dashboard/setDashboardActiveTab', 'history')"
        :class="{ _active: $store.state.dashboard.activeTab === 'history' }"
      ) {{ $t('trns.history') }}

      template(v-if="!isEmptyData")
        .tabItem(
          @click="$store.commit('dashboard/setDashboardActiveTab', 'analytics')"
          :class="{ _active: $store.state.dashboard.activeTab === 'analytics' }"
        ) {{ $t('analytics.title') }}

        .tabItem(
          @click="$store.commit('dashboard/setDashboardActiveTab', 'balance')"
          :class="{ _active: $store.state.dashboard.activeTab === 'balance' }"
        ) {{ $t('stat.balanceTitle') }}

    .tabs
      .tabItem(
        :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isLastPeriodSelected'] }"
        @click="$store.dispatch('filter/setPeriodNext')"
      ) {{ $t('buttons.prevTitle') }} {{ $t(`dates.${$store.state.filter.period}.simple`) }}

      .tabItem(
        :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isFirstPeriodSelected'] }"
        @click="$store.dispatch('filter/setPeriodPrev')"
      ) {{ $t('buttons.nextTitle') }} {{ $t(`dates.${$store.state.filter.period}.simple`) }}

</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.component
  background var(--c-bg-3)

  &__wrap
    display grid
    grid-template-columns repeat(2, 1fr)
    max-width 1100px
    padding 0 60px

.tabs
  display flex
  &:last-child
    justify-self end

.tabItem
  cursor pointer
  display flex
  align-items center
  margin-right $m7
  padding $m6
  color var(--c-font-4)
  font-size 16px
  border-bottom 1px solid transparent
  anim()

  &:last-child
    margin-right 0

  &._active
    border-bottom-color var(--c-blue-1)

  &._active
  &:hover
    color var(--c-font-2)

  &._disable
    cursor default
    opacity .3
    color var(--c-font-5)
</style>
