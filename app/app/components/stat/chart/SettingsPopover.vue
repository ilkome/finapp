<script setup lang="ts">
const { t } = useI18n()
const isOpen = ref(false)
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isOpen"
    align="end"
    isShowCloseBtn
    popoverContentClass="z-[60] w-88 max-w-[calc(100vw-1rem)] overscroll-contain"
    :title="t('stat.config.chart.settings')"
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
  </DrawerOrDropdown>
</template>
