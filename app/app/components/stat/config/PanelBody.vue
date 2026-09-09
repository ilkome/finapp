<script setup lang="ts">
import type { StatConfigPanelId } from '~/components/stat/types'

import { statViewControllerKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  panel: Exclude<StatConfigPanelId, 'root'>
}>()

const viewController = inject(statViewControllerKey, null)
const hasActiveView = computed(() => !!viewController?.activeView.value)
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1fr)] gap-3">
    <div v-if="hasActiveView" class="grid grid-cols-[minmax(0,1fr)] gap-1">
      <StatConfigBlockRules :panel="props.panel">
        <template #actions>
          <StatConfigSyncPanelButton :panel="props.panel" />
        </template>
      </StatConfigBlockRules>
    </div>
    <template v-else>
      <StatConfigPanelVisibility :panel="props.panel" />
      <StatConfigPanelContent :panel="props.panel" />
      <StatConfigSyncPanelButton :panel="props.panel" />
    </template>
  </div>
</template>
