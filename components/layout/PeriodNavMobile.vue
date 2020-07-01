<script>
export default {
  data () {
    return {
      visiblePeriodMenu: false
    }
  }
}
</script>

<template lang="pug">
.periodNav
  .periodNav__link(
    @click="$store.dispatch('filter/setPeriodPrev')"
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isFirstPeriodSelected'] }"
  )
    .mdi.mdi-chevron-left

  .periodNav__item._grow
    ContextMenu(
      :position="{ left: true, bottom: true }"
      :visible="visiblePeriodMenu"
      @onClickOpener="visiblePeriodMenu = !visiblePeriodMenu")
      template(slot="opener")
        Dropdown(:active="visiblePeriodMenu")
          template(slot="title"): Date

      template(slot="content")
        ContextMenuItem(
          icon="mdi mdi-weather-sunset-up"
          :title="$lang.dates.day.simple"
          :selected="$store.state.filter.period === 'day'"
          @onClick="$store.dispatch('filter/setPeriod', 'day')"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu")
        ContextMenuItem(
          icon="mdi mdi-calendar-week"
          :title="$lang.dates.week.simple"
          :selected="$store.state.filter.period === 'week'"
          @onClick="$store.dispatch('filter/setPeriod', 'week')"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu")
        ContextMenuItem(
          icon="mdi mdi-calendar"
          :title="$lang.dates.month.simple"
          :selected="$store.state.filter.period === 'month'"
          @onClick="$store.dispatch('filter/setPeriod', 'month')"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu")
        ContextMenuItem(
          icon="mdi mdi-calendar-star"
          :title="$lang.dates.year.simple"
          :selected="$store.state.filter.period === 'year'"
          @onClick="$store.dispatch('filter/setPeriod', 'year')"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu")
        ContextMenuItem(
          icon="mdi mdi-database"
          :title="$lang.dates.all"
          :selected="$store.state.filter.period === 'all'"
          @onClick="$store.dispatch('filter/setPeriod', 'all')"
          @onClose="visiblePeriodMenu = !visiblePeriodMenu")

    .customize
      StatCustomizeMenuMobile(
        icon="mdi mdi-tune"
        :position="{ right: true, bottom: true }")

  .periodNav__link(
    @click="$store.dispatch('filter/setPeriodNext')"
    :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isLastPeriodSelected'] }"
  )
    .mdi.mdi-chevron-right
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.periodNav
  display flex
  align-items stretch
  justify-content space-between
  width 100%
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-2)
  // border-bottom 1px solid var(--c-bg-2)

  &__link
    display flex
    align-items center
    justify-content center
    padding $m7 $m7
    color var(--c-font-3)
    font-size 32px

    +media-hover()
      background var(--c-bg-1)

    &._disable
      opacity 0

  &__item
    display flex
    align-items center
    justify-content center
    padding 0 $m7

.customize
  margin-left 20px
  @media $media-phone-sm
    display none
</style>
