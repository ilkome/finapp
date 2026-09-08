<script setup lang="ts">
import type { StatBlockPanelId } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const props = defineProps<{
  panels: StatBlockPanelId[]
}>()

const emit = defineEmits<{
  activate: [panel: StatBlockPanelId]
}>()

const { t } = useI18n()
const { conditionGroupTitle } = useStatConditionTitles()
const controller = inject(statViewControllerKey, null)
const expandedId = ref<string | null>(null)

// Rules are stored per block, but one condition is usually reused across several of them. This
// view inverts that mapping so a condition can be read as "what this changes everywhere".
const groups = computed(() => {
  const blockRules = controller?.activeView.value?.config.blockRules ?? {}
  const byCondition = new Map<string, { panels: StatBlockPanelId[], title: string }>()

  for (const panel of props.panels) {
    for (const rule of blockRules[panel] ?? []) {
      const id = JSON.stringify(rule.condition)
      const group = byCondition.get(id) ?? { panels: [], title: conditionGroupTitle(rule.condition) }
      if (!group.panels.includes(panel))
        group.panels.push(panel)
      byCondition.set(id, group)
    }
  }

  return [...byCondition].map(([id, group]) => ({ ...group, id }))
})
</script>

<template>
  <div class="grid min-w-0">
    <StatConfigExpandableBlock
      v-for="(group, index) in groups"
      :key="group.id"
      hasNext
      icon="lucide:git-branch"
      :isExpanded="expandedId === group.id"
      :showSeparator="index > 0"
      :title="group.title"
      @activate="expandedId = expandedId === group.id ? null : group.id"
    >
      <StatConfigRow
        v-for="panel in group.panels"
        :key="panel"
        compact
        hasPanel
        :icon="PANELS[panel].icon"
        :title="t(PANELS[panel].titleKey)"
        @activate="emit('activate', panel)"
      />
    </StatConfigExpandableBlock>

    <UiText
      v-if="!groups.length"
      class="px-3 py-4"
      variant="caption"
    >
      {{ t('stat.views.blockRules.emptyView') }}
    </UiText>
  </div>
</template>
