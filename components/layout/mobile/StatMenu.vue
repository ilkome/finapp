<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'LayoutMobileStatMenu',

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
  overflow-x auto
  padding 0 $m6
  padding-top $m6
  background var(--c-bg-3)

.menuItem
  cursor pointer
  flex-grow 1
  padding $m6 $m8
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border 1px solid transparent
  border-radius 50px

  &:active
    color var(--c-font-2)
    background var(--c-blue-1)

  &._active
    cursor default
    color var(--c-font-3)
    background var(--c-bg-5)
    border 1px solid var(--c-bg-5)
</style>
