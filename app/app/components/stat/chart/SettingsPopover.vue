<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UPopover
    :content="{
      align: 'end',
      side: 'bottom',
      sideOffset: 4,
    }"
    :ui="{
      content: 'z-[60] max-h-96 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain md:max-h-[calc(100dvh-2rem)]',
    }"
  >
    <UiActionButton
      :ariaLabel="t('stat.config.chart.settings')"
      size="sm"
    >
      <Icon name="lucide:sliders-horizontal" size="18" />
    </UiActionButton>

    <template #content>
      <div class="w-88 max-w-full p-3">
        <StatConfigPanelsChart />
      </div>
    </template>
  </UPopover>
</template>
