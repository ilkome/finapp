<script>
export default {
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

      .tabItem(
        @click="$store.commit('dashboard/setDashboardActiveTab', 'balance')"
        :class="{ _active: $store.state.dashboard.activeTab === 'balance' }"
      ) {{ $t('stat.balanceTitle') }}

      .tabItem(
        @click="$store.commit('dashboard/setDashboardActiveTab', 'analytics')"
        :class="{ _active: $store.state.dashboard.activeTab === 'analytics' }"
      ) &nbsp;

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
@import "~assets/stylus/variables/animations"

$background = var(--c-bg-3)
$border = var(--c-bg-1)
$text = var(--c-font-4)
$text-active = var(--c-font-1)
$text-active_light = var(--c-font-2)
$text-disable = var(--c-font-5)

.component
  background $background

  &__wrap
    display grid
    grid-template-columns repeat(2, 1fr)
    max-width 1100px
    padding 16px 60px

.tabs
  display flex
  &:last-child
    justify-self end

.tabItem
  cursor pointer
  display flex
  align-items center
  color $text
  font-size 16px
  margin-right 30px
  anim()

  &:last-child
    margin-right 0

  &._active
  &:hover
    color $text-active
    /.light-mode &
      color $text-active_light

  &._disable
    color $text-disable
</style>
