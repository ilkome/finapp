<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import type { MoneyTypeSlugNew } from '~/components/stat/types'

const props = defineProps<{
  active: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  click: [id: MoneyTypeSlugNew]
}>()

const { t } = useI18n()
const { width } = useWindowSize()

const menu = computed(() => {
  const all: {
    id: MoneyTypeSlugNew
    name: string | unknown
  }[] = [{
    id: 'netIncome',
    name: t('money.netIncome'),
  }]

  all.push({
    id: 'expense',
    name: t('money.expense'),
  })
  all.push({
    id: 'income',
    name: t('money.income'),
  })

  if (width.value > 766) {
    all.push({
      id: 'summary',
      name: t('money.split'),
    })
  }

  return all
})

function onClickStatMenu(tabName: MoneyTypeSlugNew) {
  emit('click', tabName)
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
  <UiTabs2>
    <UiTabsItem4
      v-for="item in menu"
      :key="item.id"
      :isActive="item.id === props.active"
      class="text-nowrap"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </UiTabsItem4>
  </UiTabs2>
</template>
