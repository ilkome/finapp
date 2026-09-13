<script setup lang="ts">
import { useFilterSummary } from '~/components/filter/useFilterSummary'

const { summaryText } = useFilterSummary()

const isOpen = ref(false)

const snapPoints = useSheetSnapPoints()
</script>

<template>
  <BottomSheetOrDropdown
    class="flex grow-0 gap-1"
    :isOpen="isOpen"
    popoverBodyClass="py-0! md:pb-0!"
    :snapPoints="snapPoints"
    :unmountOnHide="false"
    keyboardTrigger
    @closeModal="isOpen = false"
    @openModal="isOpen = true"
  >
    <template #trigger="{ isActive }">
      <UiTitleDropdown :isActive>
        <span class="text-nowrap">{{ summaryText }}</span>
      </UiTitleDropdown>
    </template>

    <template #custom="{ close, isExpanded }">
      <FilterPanel :isExpanded="isExpanded" @close="close" />
    </template>
  </BottomSheetOrDropdown>
</template>
