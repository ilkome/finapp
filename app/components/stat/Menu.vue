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
    id: 'summary',
    name: t('money.summary'),
  }, {
    id: 'expense',
    name: t('money.expense'),
  }, {
    id: 'income',
    name: t('money.income'),
  }]

  if (width.value > 766) {
    all.push({
      id: 'split',
      name: t('money.split'),
    })
  }

  return all
})

function onClickStatMenu(tabName: StatTabSlug) {
  document.getElementById('pageScroll')?.scrollTo(0, 0)
  emit('click', tabName)
}

watch(() => props.active, () => {
  if (!menu.value.find(i => i.id === props.active))
    onClickStatMenu(menu.value[0]!.id)
}, { immediate: true })
</script>

<template>
  <div class="-mb-px flex gap-2">
    <div
      v-for="item in menu"
      :key="item.id"
      :class="[{
        '!border-(--ui-primary) rounded-none border-b border-b-1': item.id === props.active,
        'text-muted hover:pb-1 hover:mb-1 hover:bg-[var(--item-5)]': item.id !== props.active,
      }]"
      class="text-nowrap rounded-lg px-3 py-1.5 pb-2 text-xs lg:text-sm tracking-wide"
      @click="onClickStatMenu(item.id)"
    >
      {{ item.name }}
    </div>
  </div>
</template>
