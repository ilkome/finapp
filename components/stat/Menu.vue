<script setup lang="ts">
import type { StatTabs } from '~/components/app/types'

const props = defineProps<{
  active: StatTabs
  isShowExpense: boolean
  isShowIncome: boolean
}>()

const emit = defineEmits<{
  click: [id: StatTabs]
}>()

const { $i18n } = useNuxtApp()

const menu = computed(() => {
  const all: {
    id: StatTabs
    idx: number
    name: string | unknown
  }[] = []

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

  // if (props.isShowExpense) {
  //   all.push({
  //     id: 'expense',
  //     idx: 1,
  //     name: $i18n.t('money.expense'),
  //   })
  // }

  // if (props.isShowIncome) {
  //   all.push({
  //     id: 'income',
  //     idx: 2,
  //     name: $i18n.t('money.income'),
  //   })
  // }

  return all
})

function onClickStatMenu(tabName: StatTabs) {
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

onMounted(() => {
  if (!menu.value.find(i => i.id === props.active)) {
    onClickStatMenu(menu.value[0].id)
  }
})

watch(() => props.active, () => {
  if (!menu.value.find(i => i.id === props.active)) {
    onClickStatMenu(menu.value[0].id)
  }
})
</script>

<template>
  <div
    class="flex items-center gap-1"
  >
    <UiTabsItem5
      v-for="item in menu"
      :key="item.id"
      :isActive="item.id === props.active"
      class="text-nowrap"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </UiTabsItem5>
  </div>
</template>
