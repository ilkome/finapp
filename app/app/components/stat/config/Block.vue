<script setup lang="ts">
import type { StatConfigPanelId } from '~/components/stat/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statViewControllerKey } from '~/components/stat/injectionKeys'

type ConfigPanelId = Exclude<StatConfigPanelId, 'root'>

const props = defineProps<{
  hasNext?: boolean
  isExpanded?: boolean
  panel: ConfigPanelId
  showSeparator?: boolean
  sortable?: boolean
}>()

const emit = defineEmits<{
  activate: []
}>()

const { t } = useI18n()
const viewController = inject(statViewControllerKey, null)
const hasActiveView = computed(() => !!viewController?.activeView.value)
const panelDefinition = computed(() => PANELS[props.panel])
</script>

<template>
  <StatConfigExpandableBlock
    :dataKey="panel"
    :hasNext
    :icon="panelDefinition.icon"
    :isExpanded
    :showSeparator
    :sortable
    :title="t(panelDefinition.titleKey)"
    @activate="emit('activate')"
  >
    <div
      class="grid gap-3"
      :class="panel === 'catsRound' ? 'pr-3 pb-3 pl-2' : 'px-3 pb-4'"
    >
      <div v-if="hasActiveView" class="grid gap-1">
        <StatConfigBlockRules :panel>
          <template #actions>
            <StatConfigSyncPanelButton :panel />
          </template>
        </StatConfigBlockRules>
      </div>
      <template v-else>
        <StatConfigPanelVisibility :panel />
        <StatConfigPanelContent :panel />
        <StatConfigSyncPanelButton :panel />
      </template>
    </div>
  </StatConfigExpandableBlock>
</template>
