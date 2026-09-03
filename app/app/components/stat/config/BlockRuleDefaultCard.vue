<script setup lang="ts">
import type { StatBlockPanelId } from '~/components/stat/views/types'

defineProps<{
  isExpanded: boolean
  panel: StatBlockPanelId
}>()

defineEmits<{
  toggleExpanded: []
}>()
</script>

<template>
  <StatConfigExpandableBlock
    compact
    dataKey="default-rule"
    icon="lucide:settings-2"
    :isExpanded
    :title="$t('stat.views.blockRules.default')"
    @activate="$emit('toggleExpanded')"
  >
    <div class="grid gap-0.5 px-3 pb-4">
      <StatConfigPanelVisibility :panel />
      <StatConfigPanelContent :panel />
    </div>
  </StatConfigExpandableBlock>
</template>
