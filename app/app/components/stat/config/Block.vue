<script setup lang="ts">
import type { StatConfigPanelId } from '~/components/stat/types'

import { PANELS } from '~/components/stat/config/panels/registry'

const props = defineProps<{
  panel: Exclude<StatConfigPanelId, 'root'>
  showSeparator?: boolean
  sortable?: boolean
}>()

const emit = defineEmits<{
  activate: []
}>()

const { t } = useI18n()
const panelDefinition = computed(() => PANELS[props.panel])
</script>

<template>
  <StatConfigExpandableBlock
    :dataKey="panel"
    :icon="panelDefinition.icon"
    :showSeparator
    :sortable
    :title="t(panelDefinition.titleKey)"
    @activate="emit('activate')"
  />
</template>
