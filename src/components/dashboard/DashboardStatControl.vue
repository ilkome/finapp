<script>
export default {
}
</script>

<template lang="pug">
.component
  .component__wrap
    .tabs
      .tabItem(
        @click="$store.dispatch('setPeriodPrev')"
        :class="{ _disable: $store.state.filter.period === 'all' || $store.getters.isFirstPeriodSelected }") Next {{ this.$store.state.filter.period }}
      .tabItem(
        @click="$store.dispatch('setPeriodNext')"
        :class="{ _disable: $store.state.filter.period === 'all' || $store.getters.isLastPeriodSelected }") Last {{ this.$store.state.filter.period }}
    .tabs(@click="$store.commit('toogleDashboardTrnsHistory')")
      .tabItem(:class="{ _active: !$store.state.dashboard.showTrnsHistory }") Stat
      .tabItem(:class="{ _active: $store.state.dashboard.showTrnsHistory }") History
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"

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
    padding 15px 60px

.tabs
  display flex
  cursor pointer
  &:last-child
    justify-self end

.tabItem
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
    /.theme-light &
      color $text-active_light

  &._disable
    color $text-disable
</style>
