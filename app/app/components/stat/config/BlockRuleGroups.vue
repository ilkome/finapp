<script setup lang="ts">
import type { BlockRule, StatBlockPanelId } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const props = defineProps<{
  panels: StatBlockPanelId[]
}>()

const { t } = useI18n()
const { conditionGroupTitle } = useStatConditionTitles()
const controller = inject(statViewControllerKey, null)
const expandedId = ref<string | null>(null)
const expandedRuleId = ref<string | null>(null)

// Rules are stored per block, but one condition is usually reused across several of them. This
// view inverts that mapping so a condition can be read as "what this changes everywhere".
const groups = computed(() => {
  const blockRules = controller?.activeView.value?.config.blockRules ?? {}
  const byCondition = new Map<string, { entries: { panel: StatBlockPanelId, rule: BlockRule }[], title: string }>()

  for (const panel of props.panels) {
    for (const rule of blockRules[panel] ?? []) {
      const id = JSON.stringify(rule.condition)
      const group = byCondition.get(id) ?? { entries: [], title: conditionGroupTitle(rule.condition) }
      group.entries.push({ panel, rule })
      byCondition.set(id, group)
    }
  }

  return [...byCondition].map(([id, group]) => ({ ...group, id }))
})

function updateRule(panel: StatBlockPanelId, next: BlockRule) {
  const rules = controller?.activeView.value?.config.blockRules[panel] ?? []
  void controller?.updateBlockRules(panel, rules.map(rule => rule.id === next.id ? next : rule))
}
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
      <StatConfigBlockRuleCard
        v-for="entry in group.entries"
        :key="`${entry.panel}:${entry.rule.id}`"
        :icon="PANELS[entry.panel].icon"
        :isExpanded="expandedRuleId === entry.rule.id"
        :panel="entry.panel"
        :rule="entry.rule"
        thenOnly
        :title="t(PANELS[entry.panel].titleKey)"
        @toggleExpanded="expandedRuleId = expandedRuleId === entry.rule.id ? null : entry.rule.id"
        @update="updateRule(entry.panel, $event)"
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
