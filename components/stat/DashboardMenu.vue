<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'StatDashboardMenu',

  setup () {
    const { store } = useContext()
    const activeTabStat = computed(() => store.state.ui.activeTabStat)

    function onClickStatMenu (tabName) {
      store.dispatch('ui/setActiveTabStat', tabName)
    }

    return {
      activeTabStat,
      onClickStatMenu
    }
  }
}
</script>

<template lang="pug">
.menu
  .menuItem(
    :class="{ _active: activeTabStat === 'details' }"
    @click="onClickStatMenu('details')"
  ) {{ $t('stat.periods') }}

  .menuItem(
    :class="{ _active: activeTabStat === 'expenses' }"
    @click="onClickStatMenu('expenses')"
  ) {{ $t('money.expenses') }}

  .menuItem(
    :class="{ _active: activeTabStat === 'incomes' }"
    @click="onClickStatMenu('incomes')"
  ) {{ $t('money.incomes') }}

  .menuItem(
    :class="{ _active: activeTabStat === 'history' }"
    @click="onClickStatMenu('history')"
  ) {{ $t('trns.history') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.menu
  overflow hidden
  z-index 10
  display flex
  align-items center
  justify-content space-between
  max-width 480px
  overflow-x auto
  margin 0 auto
  padding $m5 $m6
  padding-bottom 0

  +media(600px)
    overflow initial

.menuItem
  cursor pointer
  display flex
  align-items center
  justify-content center
  min-height 38px
  min-width 70px
  margin 0 $m5
  padding $m6 $m6
  color var(--c-font-4)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border-radius $m6
  anim()

  +media(400px)
    min-width 80px
    margin 0 $m5
    padding-right $m7
    padding-left $m7

  +media(600px)
    padding-right $m9
    padding-left $m9

  +media-hover()
    &:not(._active)
      cursor pointer
      color var(--c-font-3)
      background var(--c-item2-bg-hover)

  &._active
    cursor default
    color var(--c-blue-1)
    background var(--c-item-bg-active)
</style>
