<script setup lang="ts">
import { useFilterSummary } from '~/components/filter/useFilterSummary'

const { summaryText } = useFilterSummary()
const isFilterOpen = ref(false)
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isFilterOpen"
    class="flex shrink-0 snap-start snap-always gap-1"
    :collapsedSnap="500"
    :unmountOnHide="false"
    keyboardTrigger
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown :isActive>
        <span class="text-nowrap">{{ summaryText }}</span>
      </UiTitleDropdown>
    </template>

    <template #custom="{ close }">
      <FilterPanel @close="close" />
    </template>
  </DrawerOrDropdown>
</template>
