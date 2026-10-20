<script setup lang="ts">
import { useFilterSummary } from '~/components/filter/useFilterSummary'

const props = defineProps<{
  /** Full width, the chevron at the far end. */
  isBlock?: boolean
}>()

const { summaryText } = useFilterSummary()
const isFilterOpen = ref(false)
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isFilterOpen"
    :class="props.isBlock ? 'grid' : 'flex shrink-0 snap-start snap-always gap-1'"
    :collapsedSnap="500"
    :unmountOnHide="false"
    keyboardTrigger
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown :class="props.isBlock && 'w-full'" :isActive>
        <span class="text-nowrap" :class="props.isBlock && 'grow truncate'">{{ summaryText }}</span>
      </UiTitleDropdown>
    </template>

    <template #custom="{ close }">
      <FilterPanel @close="close" />
    </template>
  </DrawerOrDropdown>
</template>
