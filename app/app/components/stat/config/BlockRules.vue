<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import type { BlockRule, Condition, ConditionGroup, StatBlockPanelId } from '~/components/stat/views/types'

import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { cloneBlockRule, findMatchingBlockRule } from '~/components/stat/views/blockRules'

const props = defineProps<{
  panel: StatBlockPanelId
}>()

const { t } = useI18n()
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

watch(() => rules.value.length, (count) => {
  if (count === 0)
    expandedId.value = DEFAULT_RULE_ID
}, { immediate: true })

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
const matchingRuleId = computed(() => findMatchingBlockRule(rules.value, controller.context.value)?.id ?? null)

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

function conditionTitle(condition: Condition) {
  const comparator = condition.comparator
  if (condition.kind === 'categoryCount') {
    const field = condition.scope === 'parent'
      ? t('stat.views.conditions.scopes.parent')
      : t('stat.views.conditions.fields.categoryCount')
    return t('stat.views.blockRules.conditionSummary.categoryCount', { comparator, field, value: condition.value })
  }
  if (condition.kind === 'contentWidth')
    return t('stat.views.blockRules.conditionSummary.contentWidth', { comparator, value: condition.value })
  return t('stat.views.blockRules.conditionSummary.period', {
    comparator,
    unit: t(`stat.views.conditions.units.${condition.unit}`).toLocaleLowerCase(),
    value: condition.value,
  })
}

function flattenConditions(group: ConditionGroup, result: Condition[] = []): Condition[] {
  for (const child of group.children) {
    if ('children' in child)
      flattenConditions(child, result)
    else
      result.push(child)
  }
  return result
}

function conditionGroupTitle(group: ConditionGroup) {
  const conditions = flattenConditions(group)
  return conditions.length
    ? conditions.map(conditionTitle).join(', ')
    : t('stat.views.blockRules.new')
}
</script>

<template>
  <section class="grid gap-4">
    <div v-if="rules.length" ref="sortParent" class="grid gap-2">
      <StatConfigBlockRuleCard
        v-for="(rule, index) in rules"
        :key="rule.id"
        :isActive="matchingRuleId === rule.id"
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

    <StatConfigBlockRuleDefaultCard
      :isActive="matchingRuleId === null"
      :isExpanded="expandedId === DEFAULT_RULE_ID"
      :panel
      @toggleExpanded="expandedId = expandedId === DEFAULT_RULE_ID ? null : DEFAULT_RULE_ID"
    />

    <UDropdownMenu
      :items="ruleItems"
      :content="{ align: 'start' }"
      :ui="{ group: '[&:not(:first-child)]:before:right-0! [&:not(:first-child)]:before:left-0!' }"
    >
      <UButton
        class="w-full justify-start"
        color="neutral"
        icon="i-lucide-plus"
        :label="$t('stat.views.blockRules.addRule')"
        size="sm"
        trailingIcon="i-lucide-chevron-down"
        variant="ghost"
      />
    </UDropdownMenu>
  </section>
</template>
