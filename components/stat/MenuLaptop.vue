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
    :isActive="activeTabStat === 'expense'"
    @click="onClickStatMenu('expense')"
  ) {{ $t('money.expense') }}

  UiTabsItem(
    :isActive="activeTabStat === 'income'"
    @click="onClickStatMenu('income')"
  ) {{ $t('money.income') }}

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
