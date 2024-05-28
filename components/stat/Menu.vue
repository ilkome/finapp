<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { AppNav } from '~/components/app/types'
import { useAppNav } from '~/components/app/useAppNav'

const { $i18n } = useNuxtApp()

const menu = computed<{
  id: AppNav
  idx: number
  name: string | unknown
}[]>(() => [{
  id: 'periods',
  idx: 4,
  name: $i18n.t('stat.periods'),
}, {
  id: 'summary',
  idx: 0,
  name: $i18n.t('stat.summary'),
}, {
  id: 'expense',
  idx: 1,
  name: $i18n.t('money.expense'),
}, {
  id: 'income',
  idx: 2,
  name: $i18n.t('money.income'),
}, {
  id: 'trns',
  idx: 3,
  name: $i18n.t('trns.shortTitle'),
}, {
  id: 'statNew',
  idx: 4,
  name: $i18n.t('stat.statNew'),
}])

const { activeTabStat } = storeToRefs(useAppNav())

function onClickStatMenu(tabName: AppNav) {
  activeTabStat.value = tabName
  const page = document.querySelector('.js_scroll_page')
  const content = page?.querySelector(
    '[data-scroll-ref="stat"',
  ) as HTMLElement | null

  if (!page || !content)
    return

  const h = 78
  if (page.scrollTop > content?.offsetTop - h)
    page.scrollTop = content.offsetTop - h
}
</script>

<template>
  <div class="overflow-y-auto">
    <!-- v-if="!item.isPrivate || userStore.isDevUser" -->
    <UiTabsItem2
      v-for="item in menu"
      :key="item.id"
      :isActive="item.id === activeTabStat"
      class="!text-md !font-medium min-w-xs grow-0"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </UiTabsItem2>
  </div>
</template>
