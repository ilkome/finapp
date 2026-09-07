<script setup lang="ts">
import type { StatConfigNavPanel } from '~/components/stat/config/useStatConfigNav'

const props = defineProps<{
  panel: StatConfigNavPanel
}>()
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-3 px-1 pb-4">
    <StatViewsAutoRuleEditor v-if="props.panel === 'auto'" />
    <StatConfigPanelBody v-else :panel="props.panel" />
  </div>
</template>
