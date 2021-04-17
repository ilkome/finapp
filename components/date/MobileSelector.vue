<script>
import useMobileLayout from '~/components/layout/useMobileLayout'

export default {
  name: 'DateMobileSelector',

  setup () {
    const { showPeriodsNamesModal } = useMobileLayout()

    return {
      showPeriodsNamesModal
    }
  }
}
</script>

<template lang="pug">
.dateSelector
  .tabItem(
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isLastPeriodSelected'] }"
    @click="$store.dispatch('filter/setPeriodNext')"
  ): .mdi.mdi-chevron-left

  .menuDots(@click="showPeriodsNamesModal")
    .menuDots__name: SharedDate(:type="2")
    .menuDots__dots: .mdi.mdi-dots-vertical

  .tabItem(
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isFirstPeriodSelected'] }"
    @click="$store.dispatch('filter/setPeriodPrev')"
  ): .mdi.mdi-chevron-right
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.dateSelector
  z-index 9
  position sticky
  top 0
  display flex
  align-items center
  justify-content space-between
  padding 0 $m4
  background var(--color-bg-canvas)

.tabItem
  cursor pointer
  display flex
  align-items center
  justify-content center
  width 40px
  height 40px
  margin-right $m7
  color var(--c-font-3)
  font-size 26px
  background var(--c-bg-4)
  border-bottom 1px solid transparent
  border-radius 50%
  anim()

  &:last-child
    margin-right 0

  &._active
    color var(--c-font-2)
    border-bottom-color var(--c-blue-1)

  +media-hover()
    &:not(._disable)
      color var(--c-font-2)
      background var(--c-blue-1)

  &._disable
    cursor default
    opacity .3
    color var(--c-font-5)

.menuDots
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding $m5 $m8
  padding-right $m7
  color var(--c-font-3)
  font-size 16px
  font-weight bold
  background var(--c-bg-4)
  border-radius $m4

  +media-hover()
    color var(--c-font-2)
    background var(--c-blue-1)

  &__dots
    margin-top -2px
    margin-right -5px
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px
</style>
