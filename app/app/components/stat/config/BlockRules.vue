<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import type { BlockRule, ConditionGroup, StatBlockPanelId } from '~/components/stat/views/types'

import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { cloneBlockRule } from '~/components/stat/views/blockRules'
import { useStatConditionTitles } from '~/components/stat/views/useConditionTitles'

const props = defineProps<{
  panel: StatBlockPanelId
}>()

const { t } = useI18n()
const { conditionGroupTitle } = useStatConditionTitles()
const controller = inject(statViewControllerKey)!
const DEFAULT_RULE_ID = 'default'
const expandedId = ref<string | null>(null)
let syncingFromStore = false
const [sortParent, rules] = useDragAndDrop([] as BlockRule[], {
  dragHandle: '.blockRuleSortHandle',
})

const sourceFingerprint = computed(() => JSON.stringify(controller.activeView.value?.config.blockRules[props.panel] ?? []))
watch(sourceFingerprint, (value) => {
  if (value === JSON.stringify(rules.value))
    return
  syncingFromStore = true
  rules.value = structuredClone(JSON.parse(value) as BlockRule[])
  nextTick(() => {
    syncingFromStore = false
  })
}, { immediate: true })

const persist = debounce(() => {
  void controller.updateBlockRules(props.panel, rules.value)
}, 300)

watch(rules, () => {
  if (!syncingFromStore)
    persist()
}, { deep: true })

onBeforeUnmount(() => persist.flush())

const reusableConditions = computed(() => {
  const activeViewId = controller.activeView.value?.id
  const storedRules = controller.store.views.flatMap(view => Object.entries(view.config.blockRules).flatMap(([panel, panelRules]) => (
    view.id === activeViewId && panel === props.panel ? [] : panelRules ?? []
  )))
  const unique = new Map<string, ConditionGroup>()
  for (const rule of [...rules.value, ...storedRules]) {
    const fingerprint = JSON.stringify(rule.condition)
    if (!unique.has(fingerprint))
      unique.set(fingerprint, rule.condition)
  }
  return [...unique.values()]
})
const ruleItems = computed(() => [
  [{
    label: t('stat.views.blockRules.presets.custom'),
    onSelect: () => addRule({ children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }),
    ui: { item: 'pl-4!' },
  }],
  reusableConditions.value.map(condition => ({
    label: conditionGroupTitle(condition),
    onSelect: () => addRule(condition),
  })),
].filter(group => group.length))
function addRule(condition: ConditionGroup) {
  const rule: BlockRule = {
    condition: JSON.parse(JSON.stringify(condition)) as ConditionGroup,
    id: crypto.randomUUID(),
    isEnabled: true,
    isHidden: false,
    overrides: {},
    parameterIds: [],
  }
  rules.value = [...rules.value, rule]
  expandedId.value = rule.id
}

function updateRule(index: number, rule: BlockRule) {
  rules.value = rules.value.map((item, itemIndex) => itemIndex === index ? rule : item)
}

function duplicateRule(index: number) {
  const source = rules.value[index]
  if (!source)
    return
  const duplicate = { ...cloneBlockRule(source), id: crypto.randomUUID() }
  rules.value = [...rules.value.slice(0, index + 1), duplicate, ...rules.value.slice(index + 1)]
  expandedId.value = duplicate.id
}

function removeRule(index: number) {
  const id = rules.value[index]?.id
  rules.value = rules.value.filter((_, itemIndex) => itemIndex !== index)
  if (expandedId.value === id)
    expandedId.value = null
}

function ruleTitle(rule: BlockRule) {
  return conditionGroupTitle(rule.condition)
}
</script>

<template>
  <section class="grid gap-4">
    <div v-if="rules.length" ref="sortParent" class="grid gap-px">
      <StatConfigBlockRuleCard
        v-for="(rule, index) in rules"
        :key="rule.id"
        :isExpanded="expandedId === rule.id"
        :panel
        :rule
        :title="ruleTitle(rule)"
        @duplicate="duplicateRule(index)"
        @remove="removeRule(index)"
        @toggleExpanded="expandedId = expandedId === rule.id ? null : rule.id"
        @update="updateRule(index, $event)"
      />
    </div>

    <div class="grid gap-1">
      <UDropdownMenu
        :items="ruleItems"
        :content="{ align: 'start' }"
        :ui="{ group: '[&:not(:first-child)]:before:right-0! [&:not(:first-child)]:before:left-0!' }"
      >
        <UButton
          class="w-full justify-start rounded-sm! data-[state=open]:bg-elevated/50!"
          color="neutral"
          icon="i-lucide-plus"
          :label="$t('stat.views.blockRules.addRule')"
          size="sm"
          trailingIcon="i-lucide-chevron-down"
          variant="ghost"
        />
      </UDropdownMenu>
      <slot name="actions" />
    </div>

    <StatConfigBlockRuleDefaultCard
      :isExpanded="expandedId === DEFAULT_RULE_ID"
      :panel
      @toggleExpanded="expandedId = expandedId === DEFAULT_RULE_ID ? null : DEFAULT_RULE_ID"
    />
  </section>
</template>
