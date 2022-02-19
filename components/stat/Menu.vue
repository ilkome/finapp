<script>
export default {
  name: 'StatDashboardMenu',

  setup() {
    const { $store } = useNuxtApp()
    const activeTabStat = computed(() => $store.state.ui.activeTabStat)

    function onClickStatMenu(tabName) {
      $store.dispatch('ui/setActiveTabStat', tabName)
    }

    return {
      activeTabStat,
      onClickStatMenu,
    }
  },
}
</script>

<template lang="pug">
.overflow-hidden.overflow-x-auto.mx-3.scrollbar
  .menu__wrap.flex.items-center.space-x-8
    .menuItem.statTitle(
      :class="{ _active: activeTabStat === 'details' }"
      @click="onClickStatMenu('details')"
    ) {{ $t('stat.periods') }}

    .menuItem.statTitle(
      :class="{ _active: activeTabStat === 'expenses' }"
      @click="onClickStatMenu('expenses')"
    ) {{ $t('money.expenses') }}

    .menuItem.statTitle(
      :class="{ _active: activeTabStat === 'incomes' }"
      @click="onClickStatMenu('incomes')"
    ) {{ $t('money.incomes') }}

    .menuItem.statTitle(
      :class="{ _active: activeTabStat === 'history' }"
      @click="onClickStatMenu('history')"
    ) {{ $t('trns.history') }}
</template>

<style lang="stylus" scoped>
.menu
  &__wrap
    border-bottom 3px solid var(--c-item-bg-main)

.menuItem
  margin-bottom -3px
  padding 0 0
  padding-bottom 6px
  color var(--c-font-5)
  border-bottom 3px solid var(--c-item-bg-main)

  +media-hover()
    &:not(._active)
      cursor pointer
      color var(--c-blue-1)

  &._active
    color var(--c-font-3)
    border-bottom 3px solid var(--c-blue-1)
</style>
