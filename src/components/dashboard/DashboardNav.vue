<script>
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Date from '@/components/shared/date/Date'
import Dropdown from '@/components/shared/dropdown/Dropdown'

export default {
  components: {
    ContextMenu,
    ContextMenuItem,
    Date,
    Dropdown
  },

  data () {
    return {
      visibleContextMenu: false
    }
  }
}
</script>

<template lang="pug">
.period-nav
  .period-nav__group
    .period-nav__item(@click="$store.dispatch('setPeriod', $store.state.filter.period)")
      .date: Date

  .period-nav__group
    ._align-right
      ContextMenu(
        :position="{ right: true, top: true }"
        :visible="visibleContextMenu"
        v-on:onClickOpener="visibleContextMenu = !visibleContextMenu")
        template(slot="opener")
          Dropdown(
            :active="visibleContextMenu"
            title="Customize")
        template(slot="content")
          ContextMenuItem(
            icon="mdi mdi-chart-bar-stacked"
            title="Periods chart"
            :checkValue="$store.state.ui.statGraphsVisible"
            v-on:onClick="$store.dispatch('toogleShowStatGraphs')"
            v-on:onClose="visibleContextMenu = !visibleContextMenu")
          ContextMenuItem(
            icon="mdi mdi-chart-bubble"
            title="Cats chart"
            :checkValue="$store.state.ui.catsChart === 'visible'"
            v-on:onClick="$store.dispatch('toogleVisibleCatsChart')"
            v-on:onClose="visibleContextMenu = !visibleContextMenu")
          ContextMenuItem(
            icon="mdi mdi-chart-gantt"
            title="Cats stat"
            :checkValue="$store.state.ui.statItems === 'visible'"
            v-on:onClick="$store.dispatch('toogleVisibilityStatItems')"
            v-on:onClose="visibleContextMenu = !visibleContextMenu")
          .context-menu-sep
          ContextMenuItem(
            icon="mdi mdi-palette"
            title="Change theme"
            v-on:onClick="$store.dispatch('changeTheme')")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/fonts"

._align-right
  margin-left auto
  flex 0

._nav
  margin-right $m7
  &:last-child
    margin-right 0

.date
  flex-grow 0
  display flex
  justify-content center
  align-items center
  font-header-1()
  color var(--c-font-4)
  font-size 28px

.d-button
  display inline-flex
  align-items center
  justify-content center
  padding $m7 $m8
  font-header-1()
  color var(--c-font-4)

.period-nav
  display flex
  align-items center
  padding-bottom $m9

  &__group
    display flex
    flex 1 1
    justify-content space-between

  &__item
    display flex
    align-items center
    padding-right $m10
    &:last-child
      padding-right 0

    &._last
      display flex
      align-items flex-start
      margin-left auto
      padding-right 0
      margin-left (- $m6)

    .headerLink._periods
      display flex
      align-items center
      height 40px
      padding 0 $m7
      margin-right (- $m5)
      font-size 16px

      &._active
        color var(--c-font-2)
        background none
</style>
