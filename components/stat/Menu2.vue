<script setup lang="ts">
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

const menu = computed(() => {
  const all: {
    id: AppNav
    idx: number
    name: string | unknown
  }[] = []

  if (props.isShowIncome && props.isShowExpense) {
    all.push({
      id: 'netIncome',
      idx: 0,
      name: $i18n.t('money.sum'),
    })
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
  <div
    class="flex grow items-center gap-1 overflow-y-auto border-b border-item-6 pb-1 sm_gap-1"
  >
    <UiTabsItem5
      v-for="item in menu"
      :key="item.id"
      :isActive="item.id === props.active"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </UiTabsItem5>
  </div>
</template>
