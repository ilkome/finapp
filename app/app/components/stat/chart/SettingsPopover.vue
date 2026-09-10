<script setup lang="ts">
const { t } = useI18n()
const isOpen = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    align="end"
    :isOpen
    popoverBodyClass="px-3 pb-3"
    popoverContentClass="z-[60] w-88 max-w-[calc(100vw-1rem)] overscroll-contain"
    :title="t('stat.config.chart.settings')"
    @openModal="isOpen = true"
    @closeModal="isOpen = false"
  >
    <template #trigger>
      <UiActionButton
        :ariaLabel="t('stat.config.chart.settings')"
        class="size-8 min-h-8! min-w-8!"
        size="sm"
      >
        <Icon name="lucide:sliders-horizontal" size="18" />
      </UiActionButton>
    </template>

    <template #content>
      <StatConfigPanelsChart class="pb-2 md:pb-0" isShowSyncButton />
    </template>
  </BottomSheetOrDropdown>
</template>
