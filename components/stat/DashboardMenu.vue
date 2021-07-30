<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'StatDashboardMenu',

  setup () {
    const { store } = useContext()
    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const statAverage = computed(() => store.getters['stat/statAverage'])
    const isStatPage = computed(() => store.state.ui.activeTabViewName === 'stat')

    function onClickStatMenu (tabName) {
      store.dispatch('ui/setActiveTabStat', tabName)
    }

    return {
      activeTabStat,
      statAverage,
      isStatPage,

      onClickStatMenu
    }
  }
}
</script>

<template lang="pug">
.menu(v-if="isStatPage")
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
  justify-content center
  max-width 640px
  overflow-x auto
  margin 0 auto
  padding 0 $m6

  +media(600px)
    overflow initial

.menuItem
  cursor pointer
  display flex
  align-items center
  justify-content center
  min-height 38px
  margin 0 $m5
  padding $m6 $m6
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border-radius 50px
  anim()

  +media(400px)
    padding-right $m7
    padding-left $m7

  +media(600px)
    padding-right $m9
    padding-left $m9

  +media-hover()
    &:not(._active)
      cursor pointer
      color var(--c-font-3)
      background var(--c-bg-5)

  &._active
    cursor default
    color var(--c-blue-1)
</style>
