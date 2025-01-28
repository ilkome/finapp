<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

import type { StatTabSlug } from '~/components/stat/types'

const props = defineProps<{
  active: StatTabSlug
}>()

const emit = defineEmits<{
  click: [id: StatTabSlug]
}>()

const { t } = useI18n()
const { width } = useWindowSize()

const menu = computed(() => {
  const all: {
    id: StatTabSlug
    name: string | unknown
  }[] = [{
    id: 'netIncome',
    name: t('money.netIncome'),
  }, {
    id: 'expense',
    name: t('money.expense'),
  }, {
    id: 'income',
    name: t('money.income'),
  }, {
    id: 'trns',
    name: t('trns.history'),
  }]

  if (width.value > 766) {
    all.push({
      id: 'summary',
      name: t('money.split'),
    })
  }

  return all
})

function onClickStatMenu(tabName: StatTabSlug) {
  emit('click', tabName)
}

watch(() => props.active, () => {
  if (!menu.value.find(i => i.id === props.active)) {
    onClickStatMenu(menu.value[0].id)
  }
}, { immediate: true })

function getClasses(id?: StatTabSlug) {
  return [{
    '!border-accent-1 text-1 rounded-none border-b-2': id === props.active,
    'text-2 hover:bg-item-5': id !== props.active,
  }, 'text-nowrap rounded-lg px-3 py-1.5 text-sm font-medium']
}
</script>

<template>
  <div class="-mb-px flex gap-2">
    <div
      v-for="item in menu"
      :key="item.id"
      :class="getClasses(item.id)"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </div>
  </div>
</template>
