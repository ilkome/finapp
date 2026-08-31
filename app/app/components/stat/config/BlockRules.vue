<script setup lang="ts">
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { debounce } from 'es-toolkit'

import type { BlockRule, ConditionGroup, StatBlockPanelId } from '~/components/stat/views/types'

import { PANELS } from '~/components/stat/config/panels/registry'
import { statViewControllerKey } from '~/components/stat/injectionKeys'
import { findMatchingBlockRule } from '~/components/stat/views/blockRules'
import { generateViewName } from '~/components/stat/views/generateViewName'

const props = defineProps<{
  panel: StatBlockPanelId
}>()

defineEmits<{
  back: []
}>()

const { t } = useI18n()
const controller = inject(statViewControllerKey)!
const expandedId = ref<string | null>(null)
let syncingFromStore = false
const [sortParent, rules] = useDragAndDrop([] as BlockRule[], {
  dragHandle: '.blockRuleSortHandle',
})

const comparatorKeys: Record<string, string> = { '!=': 'neq', '<': 'lt', '<=': 'lte', '=': 'eq', '>': 'gt', '>=': 'gte' }
const labels = computed(() => ({
  and: t('stat.views.and'),
  andMore: (count: number) => t('stat.views.andMore', { count }),
  categoryCount: (scope: 'all' | 'parent', comparator: string, value: number) => t('stat.views.categoryCount', { comparator: t(`stat.views.comparators.${comparatorKeys[comparator] ?? 'eq'}`), scope: t(`stat.views.scope.${scope}`), value }),
  contentWidth: (comparator: string, value: number) => t('stat.views.contentWidth', { comparator: t(`stat.views.comparators.${comparatorKeys[comparator] ?? 'eq'}`), value }),
  fallback: t('stat.views.blockRules.new'),
  period: (value: number, unit: string) => t(`stat.views.period.${unit}`, { count: value }),
}))

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

const presets = computed(() => [[
  { label: t('stat.views.blockRules.presets.mobile'), onSelect: () => addRule({ children: [{ comparator: '<', kind: 'contentWidth', unit: 'px', value: 768 }], operator: 'and' }) },
  { label: t('stat.views.blockRules.presets.singleCategory'), onSelect: () => addRule({ children: [{ comparator: '=', kind: 'categoryCount', scope: 'all', value: 1 }], operator: 'and' }) },
  { label: t('stat.views.blockRules.presets.shortPeriod'), onSelect: () => addRule({ children: [{ comparator: '<=', kind: 'period', unit: 'week', value: 1 }], operator: 'and' }) },
  { label: t('stat.views.blockRules.presets.custom'), onSelect: () => addRule({ children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }) },
]])
const matchingRuleId = computed(() => findMatchingBlockRule(rules.value, controller.context.value)?.id ?? null)

function addRule(condition: ConditionGroup) {
  const rule: BlockRule = {
    condition,
    id: crypto.randomUUID(),
    isEnabled: true,
    overrides: {},
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
  const duplicate = { ...structuredClone(source), id: crypto.randomUUID() }
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
  return generateViewName(rule.condition, labels.value)
}
</script>

<template>
  <section class="grid gap-4 px-1">
    <div class="flex items-center gap-2 px-1">
      <UiActionButton :ariaLabel="$t('base.previous')" @click="$emit('back')">
        <Icon name="lucide:arrow-left" size="20" />
      </UiActionButton>
      <div class="min-w-0 grow">
        <UiHeaderTitle class="truncate text-lg">
          {{ $t('stat.views.blockRules.title', { block: $t(PANELS[panel].titleKey) }) }}
        </UiHeaderTitle>
      </div>
      <UDropdownMenu :items="presets">
        <UButton icon="i-lucide-plus" :aria-label="$t('stat.views.blockRules.add')" size="sm" variant="soft">
          <span class="hidden sm:inline">{{ $t('stat.views.blockRules.add') }}</span>
        </UButton>
      </UDropdownMenu>
    </div>

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

    <div v-else class="rounded-lg border border-dashed border-default px-4 py-8 text-center text-sm text-muted">
      {{ $t('stat.views.blockRules.empty') }}
    </div>
  </section>
</template>
