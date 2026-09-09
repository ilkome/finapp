<script setup lang="ts">
import type { BlockRule, ConditionGroup, StatBlockPanelId } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { useStatConfigAvailablePanels } from '~/components/stat/config/useStatConfigPanels'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { resolveBlockRuleParameterIds } from '~/components/stat/views/blockRules'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const props = defineProps<{
  condition: ConditionGroup
}>()

const { t } = useI18n()
const { conditionGroupTitles } = useStatConditionTitles()
const controller = inject(statViewControllerKey, null)
const availablePanels = useStatConfigAvailablePanels()
const expandedPanel = ref<StatBlockPanelId | null>(null)
// A block added here starts empty, so it opens with its parameter picker already down.
const addedPanel = ref<StatBlockPanelId | null>(null)

const conditionTitles = computed(() => conditionGroupTitles(props.condition))
const fingerprint = computed(() => JSON.stringify(props.condition))
const blockRules = computed(() => controller?.activeView.value?.config.blockRules ?? {})

// One condition is usually reused across blocks; this screen lists the blocks it changes.
const entries = computed(() => {
  const list = availablePanels.value.flatMap((panel) => {
    const rule = blockRules.value[panel]?.find(item => JSON.stringify(item.condition) === fingerprint.value)
    return rule ? [{ panel, rule }] : []
  })
  const added = addedPanel.value
  return added ? [...list.filter(entry => entry.panel === added), ...list.filter(entry => entry.panel !== added)] : list
})

const addBlockItems = computed(() => [availablePanels.value
  .filter(panel => !entries.value.some(entry => entry.panel === panel))
  .map(panel => ({
    icon: PANELS[panel].icon,
    label: t(PANELS[panel].titleKey),
    onSelect: () => addBlock(panel),
  }))])

function updateRule(panel: StatBlockPanelId, next: BlockRule) {
  const rules = blockRules.value[panel] ?? []
  void controller?.updateBlockRules(panel, rules.map(rule => rule.id === next.id ? next : rule))
}

function removeRule(panel: StatBlockPanelId, id: string) {
  const rules = blockRules.value[panel] ?? []
  void controller?.updateBlockRules(panel, rules.filter(rule => rule.id !== id))
  if (expandedPanel.value === panel)
    expandedPanel.value = null
  if (addedPanel.value === panel)
    addedPanel.value = null
}

// A block added here is empty until a parameter lands in it; leaving the section without one
// means the block was never really added.
onBeforeUnmount(() => {
  for (const entry of entries.value) {
    if (!resolveBlockRuleParameterIds(entry.panel, entry.rule).length)
      removeRule(entry.panel, entry.rule.id)
  }
})

function addBlock(panel: StatBlockPanelId) {
  const rule: BlockRule = {
    condition: JSON.parse(fingerprint.value) as ConditionGroup,
    id: crypto.randomUUID(),
    isEnabled: true,
    isHidden: false,
    overrides: {},
    parameterIds: [],
  }
  void controller?.updateBlockRules(panel, [...(blockRules.value[panel] ?? []), rule])
  expandedPanel.value = panel
  addedPanel.value = panel
}
</script>

<template>
  <div class="grid min-w-0">
    <UiText class="px-3 pb-3 whitespace-pre-line" variant="caption">
      {{ conditionTitles.join('\n') }}
    </UiText>

    <StatConfigExpandableBlock
      v-for="(entry, index) in entries"
      :key="entry.panel"
      hasNext
      :icon="PANELS[entry.panel].icon"
      :isExpanded="expandedPanel === entry.panel"
      :showSeparator="index > 0"
      :title="t(PANELS[entry.panel].titleKey)"
      @activate="expandedPanel = expandedPanel === entry.panel ? null : entry.panel"
    >
      <div class="grid gap-px">
        <StatConfigBlockRuleParameters
          :autoOpenAddParameter="addedPanel === entry.panel"
          :panel="entry.panel"
          :rule="entry.rule"
          @update="updateRule(entry.panel, $event)"
        />
        <StatConfigActionButton
          icon="i-lucide-circle-minus"
          :label="t('stat.views.blockRules.removeBlock')"
          @click="removeRule(entry.panel, entry.rule.id)"
        />
      </div>
    </StatConfigExpandableBlock>

    <div aria-hidden="true" class="mx-2 my-1 h-px bg-elevated/50" />

    <UDropdownMenu :items="addBlockItems">
      <StatConfigActionButton
        :disabled="!addBlockItems[0]?.length"
        icon="i-lucide-plus"
        :label="t('stat.views.blockRules.addBlock')"
        trailingIcon="i-lucide-chevron-down"
      />
    </UDropdownMenu>
  </div>
</template>
