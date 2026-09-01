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
const selectUi = { content: 'z-[80]' }
function update(children: ConditionGroup['children']) {
  emit('update:modelValue', { ...props.modelValue, children })
}
function addCondition() {
  update([...props.modelValue.children, { comparator: '>', kind: 'categoryCount', scope: 'all', value: 0 }])
}
function replace(index: number, value: Condition | ConditionGroup) {
  update(props.modelValue.children.map((child, childIndex) => childIndex === index ? value : child))
}
function remove(index: number) {
  if (props.removable && props.modelValue.children.length === 1) {
    emit('remove')
    return
  }
  update(props.modelValue.children.filter((_, childIndex) => childIndex !== index))
}
function duplicate(index: number) {
  const child = props.modelValue.children[index]
  if (!child)
    return
  const copy = JSON.parse(JSON.stringify(child)) as Condition | ConditionGroup
  update([...props.modelValue.children.slice(0, index + 1), copy, ...props.modelValue.children.slice(index + 1)])
}
function conditionActionItems(index: number) {
  return [[
    { icon: 'i-lucide-copy', label: t('base.duplicate'), onSelect: () => duplicate(index) },
  ], [
    { color: 'error' as const, icon: 'i-lucide-trash-2', label: t('base.delete'), onSelect: () => remove(index) },
  ]]
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
    <template v-for="(child, index) in modelValue.children" :key="index">
      <div v-if="'children' in child" class="grid gap-2">
        <USelect
          v-if="index > 0"
          class="w-20"
          :content="{ position: 'item-aligned' }"
          :items="operators"
          :modelValue="modelValue.operator"
          :ui="selectUi"
          :aria-label="t('stat.views.conditions.labels.operator')"
          @update:modelValue="$emit('update:modelValue', { ...modelValue, operator: $event as 'and' | 'or' })"
        />
        <StatViewsConditionEditor
          :depth="(depth ?? 0) + 1"
          :modelValue="child"
          removable
          @remove="remove(index)"
          @update:modelValue="replace(index, $event)"
        />
      </div>
      <div
        v-else
        class="relative min-w-0 pr-11"
      >
        <div class="flex min-w-0 flex-wrap items-center gap-1">
          <USelect
            v-if="index > 0"
            class="w-20 shrink-0"
            :content="{ position: 'item-aligned' }"
            :items="operators"
            :modelValue="modelValue.operator"
            :ui="selectUi"
            :aria-label="t('stat.views.conditions.labels.operator')"
            @update:modelValue="$emit('update:modelValue', { ...modelValue, operator: $event as 'and' | 'or' })"
          />
          <USelect class="min-w-32 grow" :content="{ position: 'item-aligned' }" :items="fields" :modelValue="child.kind" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.field')" @update:modelValue="replace(index, changeKind(child, $event as Condition['kind']))" />
          <USelect class="w-16 shrink-0" :content="{ position: 'item-aligned' }" :items="comparators" :modelValue="child.comparator" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.comparator')" @update:modelValue="replace(index, { ...child, comparator: $event as Condition['comparator'] })" />
          <UInputNumber
            class="w-24 shrink-0"
            :decrement="false"
            :increment="false"
            :min="child.kind === 'period' ? 1 : 0"
            :modelValue="child.value"
            :ui="{ base: 'text-center' }"
            @update:modelValue="replace(index, { ...child, value: Number($event) })"
          />
          <USelect v-if="child.kind === 'period'" class="w-24 shrink-0" :content="{ position: 'item-aligned' }" :items="units" :modelValue="child.unit" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.unit')" @update:modelValue="replace(index, { ...child, unit: $event as 'day' | 'week' | 'month' | 'year' })" />
          <span v-else-if="child.kind === 'contentWidth'" class="w-10 shrink-0 px-2 text-sm text-muted">px</span>
          <USelect v-else class="w-38 shrink-0" :content="{ position: 'item-aligned' }" :items="scopes" :modelValue="child.scope" :ui="selectUi" :aria-label="t('stat.views.conditions.labels.scope')" @update:modelValue="replace(index, { ...child, scope: $event as 'all' | 'parent' })" />
        </div>
        <div class="absolute top-0 right-0 flex justify-end">
          <UDropdownMenu :items="conditionActionItems(index)" :content="{ align: 'end' }" :modal="false">
            <UiActionButton :ariaLabel="$t('base.moreOptions')" @click.stop>
              <Icon name="lucide:ellipsis" size="18" />
            </UiActionButton>
          </UDropdownMenu>
        </div>
      </div>
    </template>
    <div v-if="!removable">
      <UButton
        class="w-full justify-start"
        color="neutral"
        icon="i-lucide-plus"
        :label="t('stat.views.conditions.addCondition')"
        size="sm"
        variant="ghost"
        @click="addCondition"
      />
    </div>
  </div>
</template>
