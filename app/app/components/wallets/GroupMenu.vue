<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

import type { WalletsGroupedBy } from '~/components/wallets/types'

import { useWalletGroupingOptions } from '~/components/wallets/useWalletGroupingOptions'

// One "Group by" menu for the wallets page and every selector. The host supplies the trigger
// (its own button style / icon set) in the default slot.
const props = defineProps<{
  groupedBy: WalletsGroupedBy
}>()

const emit = defineEmits<{
  'update:groupedBy': [value: WalletsGroupedBy]
}>()

const { t } = useI18n()
const options = useWalletGroupingOptions()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { icon: 'lucide:list-tree', label: t('wallets.page.groupBy'), type: 'label' },
    { class: 'ms-2!', type: 'separator' },
    ...options.value.map(option => ({
      checked: props.groupedBy === option.id,
      icon: option.icon,
      label: option.label,
      onSelect: () => emit('update:groupedBy', option.id),
      type: 'checkbox' as const,
    })),
  ],
])
</script>

<template>
  <UDropdownMenu :content="{ align: 'end' }" :items>
    <slot />
  </UDropdownMenu>
</template>
