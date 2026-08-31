<script setup lang="ts">
import type { Condition, ConditionGroup } from './types'

defineOptions({ name: 'StatViewsConditionEditor' })

const props = defineProps<{ depth?: number, modelValue: ConditionGroup, removable?: boolean }>()
const emit = defineEmits<{ 'remove': [], 'update:modelValue': [value: ConditionGroup] }>()
const { t } = useI18n()
const comparators = ['<', '<=', '=', '!=', '>=', '>'].map(value => ({ label: value, value }))
const fields = computed(() => [
  { label: t('stat.views.conditions.fields.period'), value: 'period' },
  { label: t('stat.views.conditions.fields.categoryCount'), value: 'categoryCount' },
  { label: t('stat.views.conditions.fields.contentWidth'), value: 'contentWidth' },
])
const operators = computed(() => [
  { label: t('stat.views.conditions.operators.and'), value: 'and' },
  { label: t('stat.views.conditions.operators.or'), value: 'or' },
])
const units = computed(() => ['day', 'week', 'month', 'year'].map(value => ({ label: t(`stat.views.conditions.units.${value}`), value })))
const scopes = computed(() => [
  { label: t('stat.views.conditions.scopes.all'), value: 'all' },
  { label: t('stat.views.conditions.scopes.parent'), value: 'parent' },
])
const selectUi = { content: 'z-[60]' }

function update(children: ConditionGroup['children']) {
  emit('update:modelValue', { ...props.modelValue, children })
}
function addCondition() {
  update([...props.modelValue.children, { comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }])
}
function addGroup() {
  update([...props.modelValue.children, { children: [{ comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }], operator: 'and' }])
}
function replace(index: number, value: Condition | ConditionGroup) {
  update(props.modelValue.children.map((child, childIndex) => childIndex === index ? value : child))
}
function remove(index: number) {
  update(props.modelValue.children.filter((_, childIndex) => childIndex !== index))
}
function changeNumber(index: number, condition: Condition, change: number) {
  const min = condition.kind === 'period' ? 1 : 0
  replace(index, { ...condition, value: Math.max(min, condition.value + change) })
}
function changeKind(condition: Condition, kind: Condition['kind']) {
  if (kind === 'period')
    return { comparator: condition.comparator, kind, unit: 'day' as const, value: 1 }
  if (kind === 'contentWidth')
    return { comparator: condition.comparator, kind, unit: 'px' as const, value: 768 }
  return { comparator: condition.comparator, kind, scope: 'all' as const, value: 0 }
}
</script>

<template>
  <div class="grid gap-2">
    <div v-if="removable" class="flex justify-end">
      <UButton v-if="removable" color="error" icon="i-lucide-trash-2" size="xs" variant="ghost" @click="$emit('remove')" />
    </div>
    <template v-for="(child, index) in modelValue.children" :key="index">
      <div v-if="index > 0" class="flex items-center gap-2">
        <div aria-hidden="true" class="h-px flex-1 bg-(--ui-border-muted)" />
        <USelect
          class="w-20"
          :content="{ position: 'item-aligned' }"
          :items="operators"
          :modelValue="modelValue.operator"
          :ui="selectUi"
          :aria-label="t('stat.views.conditions.labels.operator')"
          @update:modelValue="$emit('update:modelValue', { ...modelValue, operator: $event as 'and' | 'or' })"
        />
        <div aria-hidden="true" class="h-px flex-1 bg-(--ui-border-muted)" />
      </div>
      <StatViewsConditionEditor
        v-if="'children' in child"
        :depth="(depth ?? 0) + 1"
        :modelValue="child"
        removable
        @remove="remove(index)"
        @update:modelValue="replace(index, $event)"
      />
      <div v-else class="flex flex-wrap items-center gap-1">
        <USelect class="w-30" :content="{ position: 'item-aligned' }" :items="fields" :modelValue="child.kind" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.field')" @update:modelValue="replace(index, changeKind(child, $event as Condition['kind']))" />
        <USelect class="w-16" :content="{ position: 'item-aligned' }" :items="comparators" :modelValue="child.comparator" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.comparator')" @update:modelValue="replace(index, { ...child, comparator: $event as Condition['comparator'] })" />
        <UFieldGroup class="w-28" @pointerdown.stop>
          <UButton
            :aria-label="t('stat.views.conditions.decrement')"
            color="neutral"
            icon="i-lucide-minus"
            size="sm"
            variant="outline"
            :disabled="child.value <= (child.kind === 'period' ? 1 : 0)"
            @click="changeNumber(index, child, -1)"
          />
          <UInputNumber
            class="min-w-0 grow"
            :decrement="false"
            :increment="false"
            :min="child.kind === 'period' ? 1 : 0"
            :modelValue="child.value"
            :ui="{ base: 'text-center' }"
            @update:modelValue="replace(index, { ...child, value: Number($event) })"
          />
          <UButton
            :aria-label="t('stat.views.conditions.increment')"
            color="neutral"
            icon="i-lucide-plus"
            size="sm"
            variant="outline"
            @click="changeNumber(index, child, 1)"
          />
        </UFieldGroup>
        <USelect v-if="child.kind === 'period'" class="w-24" :content="{ position: 'item-aligned' }" :items="units" :modelValue="child.unit" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.unit')" @update:modelValue="replace(index, { ...child, unit: $event as 'day' | 'week' | 'month' | 'year' })" />
        <span v-else-if="child.kind === 'contentWidth'" class="px-2 text-sm text-muted">px</span>
        <USelect v-else class="w-38" :content="{ position: 'item-aligned' }" :items="scopes" :modelValue="child.scope" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.scope')" @update:modelValue="replace(index, { ...child, scope: $event as 'all' | 'parent' })" />
        <UButton color="error" icon="i-lucide-x" size="xs" variant="ghost" @click="remove(index)" />
      </div>
    </template>
    <div class="flex gap-1">
      <UButton :label="t('stat.views.conditions.addCondition')" size="xs" variant="soft" @click="addCondition" />
      <UButton :label="t('stat.views.conditions.addGroup')" size="xs" variant="ghost" @click="addGroup" />
    </div>
  </div>
</template>
