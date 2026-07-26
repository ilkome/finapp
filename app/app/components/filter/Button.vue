<script setup lang="ts">
import { useFilterSummary } from '~/components/filter/useFilterSummary'

const { t } = useI18n()
const { summaryText } = useFilterSummary()

const isOpen = ref(false)

// Touch: keep the drag-to-expand detent. Mouse (no gesture): open a full,
// scrollable sheet - `undefined` disables the detent.
const isTouch = useMediaQuery('(pointer: coarse)')
const snapPoints = computed(() => isTouch.value ? [500, 0.98] : undefined)
</script>

<template>
  <BottomSheetOrDropdown
    class="flex grow-0 gap-1"
    :isOpen="isOpen"
    :snapPoints="snapPoints"
    :title="t('base.filters')"
    :unmountOnHide="false"
    isShowCloseBtn
    keyboardTrigger
    @closeModal="isOpen = false"
    @openModal="isOpen = true"
  >
    <template #trigger="{ isActive }">
      <UiTitleCollapse
        class="text-md grow-0! bg-elevated/30"
        isShown
      >
        <span class="flex items-center gap-1 text-xs font-medium tracking-normal md:text-base md:font-semibold md:tracking-wide">
          <span class="text-nowrap">{{ summaryText }}</span>
          <Icon
            name="lucide:chevron-down"
            size="18"
            class="shrink-0 text-muted transition-transform"
            :class="isActive && 'rotate-180'"
          />
        </span>
      </UiTitleCollapse>
    </template>

    <template #custom="{ close, isExpanded }">
      <FilterPanel :isExpanded="isExpanded" @close="close" />
    </template>
  </BottomSheetOrDropdown>
</template>
