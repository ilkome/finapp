<script setup lang="ts">
const { $store } = useNuxtApp()
const activeTabStat = computed(() => $store.state.ui.activeTabStat)

function onClickStatMenu(tabName) {
  $store.dispatch('ui/setActiveTabStat', tabName)
}
</script>

<template lang="pug">
UiTabs
  UiTabsItem(
    :isActive="activeTabStat === 'details'"
    @click="onClickStatMenu('details')"
  ) {{ $t('stat.periods') }}

  UiTabsItem(
    :isActive="activeTabStat === 'expenses'"
    @click="onClickStatMenu('expenses')"
  ) {{ $t('money.expenses') }}

  UiTabsItem(
    :isActive="activeTabStat === 'incomes'"
    @click="onClickStatMenu('incomes')"
  ) {{ $t('money.incomes') }}

  UiTabsItem(
    :isActive="activeTabStat === 'trns'"
    @click="onClickStatMenu('trns')"
  ) {{ $t('trns.shortTitle') }}

  UiTabsItem(
    :isActive="activeTabStat === 'history'"
    @click="onClickStatMenu('history')"
  )
    span {{ $t('trns.history') }}
</template>
