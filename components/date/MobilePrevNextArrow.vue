<script>
export default {
}
</script>

<template lang="pug">
div
  .tabItem._left(
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isLastPeriodSelected'] }"
    @click="$store.dispatch('filter/setPeriodNext')"
  )
    svg(width="24" height="24" fill="currentColor")
      path(d="M17.171 2.937a1.5 1.5 0 0 0-2.343-1.874l2.343 1.874zM8 12l-1.171-.937a1.5 1.5 0 0 0 0 1.874L8 12zm6.829 10.937a1.5 1.5 0 0 0 2.343-1.874l-2.343 1.874zm0-21.874l-8 10 2.343 1.874 8-10-2.343-1.874zm-8 11.874l8 10 2.343-1.874-8-10-2.343 1.874z")

  .tabItem._right(
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isFirstPeriodSelected'] }"
    @click="$store.dispatch('filter/setPeriodPrev')"
  )
    svg(width="24" height="24" fill="currentColor")
      path(d="M17.171 2.937a1.5 1.5 0 0 0-2.343-1.874l2.343 1.874zM8 12l-1.171-.937a1.5 1.5 0 0 0 0 1.874L8 12zm6.829 10.937a1.5 1.5 0 0 0 2.343-1.874l-2.343 1.874zm0-21.874l-8 10 2.343 1.874 8-10-2.343-1.874zm-8 11.874l8 10 2.343-1.874-8-10-2.343 1.874z")

</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.tabItem
  z-index 10
  cursor pointer
  position absolute
  top 60%
  display flex
  align-items center
  width 35px
  height 60px
  color var(--c-font-5)
  anim()

  &:last-child
    margin-right 0

  &._active
    color var(--c-font-2)
    border-bottom-color var(--c-blue-1)

  +media-hover()
    &:not(._disable)
      color var(--c-font-1)
      background var(--c-blue-1)

  &._disable
    opacity 0

  &._left
    left 0px
    justify-content flex-start
    border-radius 0 32px 32px 0

    +media(950px)
      left 16px
      justify-content center
      border-radius 32px

  &._right
    right 0px
    justify-content flex-end
    padding-right 4px
    border-radius 32px 0 0 32px

    +media(950px)
      right 16px
      justify-content center
      padding-left 4px
      border-radius 32px

    svg
      transform rotate(180deg)
</style>
