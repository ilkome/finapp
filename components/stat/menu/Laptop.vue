<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'

const { $store } = useNuxtApp()
const { menu } = useStatPage()
const activeTabStat = computed(() => $store.state.ui.activeTabStat)

function onClickStatMenu(tabName) {
  $store.dispatch('ui/setActiveTabStat', tabName)
}
</script>

<template lang="pug">
UiTabs
  UiTabsItem(
    v-for="item in menu"
    v-if="!item.isPrivate || $store.getters['user/isDevUser']"
    :key="item.id"
    :isActive="item.id === activeTabStat"
    @click="onClickStatMenu(item.id)"
  ) {{ item.name }}
</template>
