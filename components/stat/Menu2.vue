<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { AppNav } from '~/components/app/types'

const props = defineProps<{
  active: AppNav
  isShowExpense: boolean
  isShowIncome: boolean
}>()

const emit = defineEmits<{
  click: [id: AppNav]
}>()

const { $i18n } = useNuxtApp()

const menu = computed<{
  id: AppNav
  idx: number
  name: string | unknown
}[]>(() => {
  const all = []

  if (props.isShowIncome && props.isShowExpense) {
    all.push({
      id: 'sum',
      idx: 0,
      name: $i18n.t('stat.summary'),
    })
  }

  if (props.isShowExpense) {
    all.push({
      id: 'expense',
      idx: 1,
      name: $i18n.t('money.expense'),
    })
  }

  if (props.isShowIncome) {
    all.push({
      id: 'income',
      idx: 2,
      name: $i18n.t('money.income'),
    })
  }

  all.push({
    id: 'trns',
    idx: 3,
    name: $i18n.t('trns.shortTitle'),
  })

  return all
})

function onClickStatMenu(tabName: AppNav) {
  emit('click', tabName)
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
      :isActive="item.id === props.active"
      class="!text-md !font-medium min-w-xs grow-0"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </UiTabsItem2>
  </div>
</template>
