<script setup lang="ts">
import { useFilterSummary } from '~/components/filter/useFilterSummary'

const { t } = useI18n()
const { summaryText } = useFilterSummary()

const isOpen = ref(false)

const snapPoints = useSheetSnapPoints()
</script>

<template>
  <BottomSheetOrDropdown
    class="flex grow-0 gap-1"
    :isOpen="isOpen"
    :snapPoints="snapPoints"
    :title="t('base.filters')"
    titleClass="pb-0!"
    :unmountOnHide="false"
    isShowCloseBtn
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
