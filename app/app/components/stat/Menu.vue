<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

import type { StatTabSlug } from '~/components/stat/types'

import { tabsNavUi } from '~/components/menu/Tabs'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  active: StatTabSlug
}>()

const emit = defineEmits<{
  click: [id: StatTabSlug]
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!

const menu = computed<NavigationMenuItem[]>(() => {
  const make = (value: StatTabSlug, label: string): NavigationMenuItem => ({
    active: props.active === value,
    label,
    onSelect: () => onClickStatMenu(value),
    value,
  })

  const all = [
    make('summary', t('money.summary')),
    make('expense', t('money.expense')),
    make('income', t('money.income')),
  ]

  if (statConfig.showTabs.value)
    all.push(make('split', t('money.split')))

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
  <UNavigationMenu
    :items="menu"
    highlight
    class="w-full"
    :ui="tabsNavUi"
  />
</template>
