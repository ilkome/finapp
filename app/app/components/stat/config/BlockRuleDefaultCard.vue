<script setup lang="ts">
import type { StatBlockPanelId } from '~/components/stat/views/types'

defineProps<{
  isActive: boolean
  isExpanded: boolean
  panel: StatBlockPanelId
}>()

defineEmits<{
  toggleExpanded: []
}>()
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-default bg-default">
    <button
      type="button"
      class="flex min-h-12 w-full items-center gap-2 px-3 text-left"
      :class="isActive && 'bg-primary/5'"
      @click="$emit('toggleExpanded')"
    >
      <Icon name="lucide:settings-2" class="shrink-0 text-muted" size="18" />
      <span class="min-w-0 grow">
        <span class="block truncate text-sm">{{ $t('stat.views.blockRules.default') }}</span>
        <span class="block truncate text-xs text-muted">{{ $t('stat.views.blockRules.defaultDescription') }}</span>
      </span>
      <Icon
        name="lucide:chevron-right"
        class="shrink-0 text-muted transition-transform"
        :class="isExpanded && 'rotate-90'"
        size="18"
      />
    </button>

    <UCollapsible :open="isExpanded" :ui="{ content: 'overflow-hidden' }">
      <template #content>
        <div class="grid gap-0.5 border-t border-default px-3 py-4">
          <StatConfigPanelVisibility :panel />
          <StatConfigPanelContent :panel />
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
