<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { AppNav } from '~/components/app/types'
import { useAppNav } from '~/components/app/useAppNav'

const { $i18n } = useNuxtApp()

const menu = computed<{
  idx: number
  id: AppNav
  name: string | unknown
}[]>(() => [{
  idx: 0,
  id: 'summary',
  name: $i18n.t('stat.periods'),
}, {
  idx: 1,
  id: 'expense',
  name: $i18n.t('money.expense'),
}, {
  idx: 2,
  id: 'income',
  name: $i18n.t('money.income'),
}, {
  idx: 3,
  id: 'trns',
  name: $i18n.t('trns.shortTitle'),
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
  <div>
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
