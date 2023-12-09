<script setup lang="ts">
import dayjs from 'dayjs'
const { $store } = useNuxtApp()

const dates = computed(() => ({
  next: dayjs($store.state.filter.date).add(1, $store.state.filter.period).startOf($store.state.filter.period).valueOf(),
  prev: dayjs($store.state.filter.date).subtract(1, $store.state.filter.period).startOf($store.state.filter.period).valueOf(),
}))
</script>

<template lang="pug">
.flex.justify-between.px-3
  .arrowDate.cursor-pointer.p-2.px-4.pl-2.flex.gap-2.bg-item-main-bg._left.rounded-md(
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isNewestPeriodSelected'] }"
    @click="$store.dispatch('filter/setPeriodNext')"
  )
    svg(width="24" height="24" fill="currentColor")
      path(d="M17.171 2.937a1.5 1.5 0 0 0-2.343-1.874l2.343 1.874zM8 12l-1.171-.937a1.5 1.5 0 0 0 0 1.874L8 12zm6.829 10.937a1.5 1.5 0 0 0 2.343-1.874l-2.343 1.874zm0-21.874l-8 10 2.343 1.874 8-10-2.343-1.874zm-8 11.874l8 10 2.343-1.874-8-10-2.343 1.874z")

    SharedDate.text-sm(
      :date="dates.prev"
      :period="$store.state.filter.period"
    )

  .arrowDate.cursor-pointer.p-2.px-4.pr-2.flex.gap-2.bg-item-main-bg._right.rounded-md(
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isOldestPeriodSelected'] }"
    @click="$store.dispatch('filter/setPeriodPrev')"
  )
    SharedDate.text-sm(
      :date="dates.next"
      :period="$store.state.filter.period"
    )

    svg(width="24" height="24" fill="currentColor")
      path(d="M17.171 2.937a1.5 1.5 0 0 0-2.343-1.874l2.343 1.874zM8 12l-1.171-.937a1.5 1.5 0 0 0 0 1.874L8 12zm6.829 10.937a1.5 1.5 0 0 0 2.343-1.874l-2.343 1.874zm0-21.874l-8 10 2.343 1.874 8-10-2.343-1.874zm-8 11.874l8 10 2.343-1.874-8-10-2.343 1.874z")
</template>

<style lang="stylus" scoped>
.arrowDate
  display flex
  align-items center
  color var(--c-font-5)
  anim()

  &._active
    color var(--c-font-2)
    border-bottom-color var(--c-blue-1)

  +media-hover()
    &:not(._disable)
      color var(--c-font-1)
      background var(--c-blue-1)

  &._disable
    visibility hidden
    opacity 0

  &._left
    left 0
    justify-content flex-start

    +media(950px)
      left 16px
      justify-content center

  &._right
    right 0
    justify-content flex-end
    padding-right 4px

    +media(950px)
      right 16px
      justify-content center
      padding-left 4px

    svg
      transform rotate(180deg)
</style>
