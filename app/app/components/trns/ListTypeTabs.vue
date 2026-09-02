<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { TrnsViewType } from '~/components/trns/types'

defineProps<{
  filterBy: TrnsViewType | 'all'
  realTypesCount: number
  typeFilterItems: TabsItem[]
}>()

const emit = defineEmits<{
  setFilterBy: [type: TrnsViewType | 'all']
}>()
</script>

<template>
  <UiTabs
    v-if="realTypesCount > 1"
    size="xs"
    class="mb-2 [&>button]:py-[7px]"
    :items="typeFilterItems"
    :modelValue="filterBy"
    @update:modelValue="(value) => emit('setFilterBy', value as TrnsViewType | 'all')"
  />
</template>
