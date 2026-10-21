<script setup lang="ts">
import { useFilterSummary } from '~/components/filter/useFilterSummary'
import { sheetGlassClass } from '~/components/ui/sheetGlass'

const props = defineProps<{
  /** A full-width button, styled like the other sheet footer buttons. */
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
      <UButton
        v-if="props.isBlock"
        block
        class="h-auto flex-col gap-1 rounded-md py-2 text-sm font-normal" :class="[sheetGlassClass]"
        color="neutral"
        size="xl"
        variant="soft"
        icon="i-lucide-filter"
      >
        <span class="truncate">{{ summaryText }}</span>
      </UButton>
      <UiTitleDropdown v-else :isActive>
        <span class="text-nowrap">{{ summaryText }}</span>
      </UiTitleDropdown>
    </template>

    <template #custom="{ close }">
      <FilterPanel @close="close" />
    </template>
  </DrawerOrDropdown>
</template>
