<script setup lang="ts">
import type { ConditionGroup, StatBlockPanelId } from '~/components/stat/views/types'

import { statConfigRuleNavPanel, useStatConfigNav } from '~/components/stat/config/useStatConfigNav'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const props = defineProps<{
  panels: StatBlockPanelId[]
}>()

const { t } = useI18n()
const { conditionGroupTitles } = useStatConditionTitles()
const { open: openPanel } = useStatConfigNav()
const controller = inject(statViewControllerKey, null)

// Rules are stored per block, but one condition is usually reused across several of them. This
// view inverts that mapping so a condition can be read as "what this changes everywhere".
const groups = computed(() => {
  const blockRules = controller?.activeView.value?.config.blockRules ?? {}
  const byCondition = new Map<string, { condition: ConditionGroup, title: string }>()

  for (const panel of props.panels) {
    for (const rule of blockRules[panel] ?? []) {
      const id = JSON.stringify(rule.condition)
      if (!byCondition.has(id))
        byCondition.set(id, { condition: rule.condition, title: conditionGroupTitles(rule.condition).join('\n') })
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
      icon="lucide:git-branch"
      :showSeparator="index > 0"
      :title="group.title"
      @activate="openPanel(statConfigRuleNavPanel(group.condition))"
    />

    <UiText
      v-if="!groups.length"
      class="px-3 py-4"
      variant="caption"
    >
      {{ t('stat.views.blockRules.emptyView') }}
    </UiText>
  </div>
</template>
