<script setup lang="ts">
const { $store, nuxt2Context: { i18n } } = useNuxtApp()

const activeTabStat = computed(() => $store.state.ui.activeTabStat)

function onClickStatMenu(tabName) {
  $store.dispatch('ui/setActiveTabStat', tabName)
  const page = document.querySelector('.js_scroll_page')
  const content = page?.querySelector('[data-scroll-ref="stat"') as HTMLElement | null
  const h = 78

  if (!page && !content)
    return

  if (page.scrollTop > content?.offsetTop - h)
    page.scrollTop = content.offsetTop - h
}

const menu = computed(() => [{
  idx: 0,
  id: 'details',
  name: i18n.t('stat.periods'),
}, {
  idx: 1,
  id: 'expense',
  name: i18n.t('money.expense'),
}, {
  idx: 2,
  id: 'income',
  name: i18n.t('money.income'),
}, {
  idx: 3,
  id: 'trns',
  name: i18n.t('trns.shortTitle'),
}, {
  idx: 4,
  id: 'history',
  name: i18n.t('trns.history'),
}])
</script>

<template lang="pug">
UiTabs2
  UiTabsItem2(
    v-for="item in menu"
    v-if="!item.isPrivate || $store.getters['user/isDevUser']"
    :key="item.id"
    :isActive="item.id === activeTabStat"
    @click="onClickStatMenu(item.id)"
  ) {{ item.name }}
</template>
