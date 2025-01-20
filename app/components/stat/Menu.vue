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
  <div class="-mb-px flex gap-2">
    <div
      v-for="item in menu"
      :key="item.id"
      class="text-nowrap rounded-lg px-3 py-1.5 text-sm font-medium"
      :class="[{
        'rounded-none border-b-2 !border-accent-1 text-1': item.id === props.active,
        'text-2 hover:bg-item-5': item.id !== props.active,
      },
      ]"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </div>
  </div>
</template>
