<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { StatTabSlug } from '~/components/stat/types'

import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  active: StatTabSlug
}>()

const emit = defineEmits<{
  click: [id: StatTabSlug]
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const menu = computed<TabsItem[]>(() => {
  const all: TabsItem[] = [
    { label: t('money.summary'), value: 'summary' },
    { label: t('money.expense'), value: 'expense' },
    { label: t('money.income'), value: 'income' },
  ]

  if (statConfig.showTabs.value)
    all.push({ label: t('money.split'), value: 'split' })

  return all
})

function onClickStatMenu(tabName: StatTabSlug) {
  document.getElementById('pageScroll')?.scrollTo(0, 0)
  emit('click', tabName)
}

watch(() => props.active, () => {
  if (!menu.value.some(i => i.value === props.active))
    onClickStatMenu(menu.value[0]!.value as StatTabSlug)
}, { immediate: true })
</script>

<template>
  <UiTabs
    :items="menu"
    :modelValue="active"
    class="w-full"
    variant="link"
    @update:modelValue="(v) => onClickStatMenu(v as StatTabSlug)"
  />
</template>
